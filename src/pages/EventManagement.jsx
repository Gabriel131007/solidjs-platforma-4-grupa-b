import { createSignal, Show, For, createEffect } from "solid-js";
import { authService } from "../services/auth.js";
import Message from "../components/Message.jsx";
import { db } from "../lib/firebase.js";
import { collection, addDoc, query, where, updateDoc, deleteDoc, getDocs, doc, limit, orderBy } from "firebase/firestore";

export default function EventManagement() {
    let formRef;

    const [searchTerm, setSearchTerm] = createSignal("");
    const [events, setEvents] = createSignal([]);
    const [selectedEvent, setSelectedEvent] = createSignal(null);
    const [loading, setLoading] = createSignal(false);
    const [error, setError] = createSignal(null);
    const [success, setSuccess] = createSignal(null);
    const [difficultyFilter, setDifficultyFilter] = createSignal("all");

    const difficulties = ["Beginner", "Intermediate", "Advanced"];

    // pomoćna funkcija za dobivanje CSS klase za razinu težine
    const getDifficultyBadgeClass = (difficulty) => {
        switch(difficulty) {
            case "Beginner": return "badge-success";
            case "Intermediate": return "badge-warning";
            case "Advanced": return "badge-error";
            default: return "badge-ghost";
        }
    };

    // učitavanje prvih 10 događaja
    const loadInitialEvents = async () => {
        setLoading(true);
        setError(null);
        try {
            const user = authService.getCurrentUser();
            if (!user) {
                setError("Korisnik nije prijavljen");
                return;
            }
            
            const userId = user.uid;
            const eventsRef = collection(db, "events");
            const q = query(
                eventsRef,
                where("userId", "==", userId)
            );
            const snapshot = await getDocs(q);
            const allEvents = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            
            // sortiramo na klijentskoj strani umjesto u upitu
            allEvents.sort((a, b) => {
                const dateA = a.created?.toDate ? a.created.toDate() : new Date(a.created);
                const dateB = b.created?.toDate ? b.created.toDate() : new Date(b.created);
                return dateB - dateA;
            });
            
            setEvents(allEvents.slice(0, 10));
        } catch (error) {
            console.error("Load error:", error.message);
            setError("Greška inicijalnog učitavanja događaja");
        } finally {
            setLoading(false);
        }
    }
    
    // pozivamo tek kad je komponenta montirana
    createEffect(() => {
        loadInitialEvents();
    });

    // pretraživanje
    const searchEvents = async () => {
        const term = searchTerm().toLowerCase().trim();
        if (!term || term.length <= 3) return;

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const user = authService.getCurrentUser();
            if (!user) {
                setError("Korisnik nije prijavljen");
                return;
            }
            
            const userId = user.uid;
            const eventsRef = collection(db, "events");
            const q = query(
                eventsRef,
                where("userId", "==", userId)
            );
            const snapshot = await getDocs(q);
            const found = snapshot.docs
                .map((doc) => ({ id: doc.id, ...doc.data() }))
                .filter((event) => event.name.toLowerCase().includes(term));
            
            // sortiramo po datumu kreiranja
            found.sort((a, b) => {
                const dateA = a.created?.toDate ? a.created.toDate() : new Date(a.created);
                const dateB = b.created?.toDate ? b.created.toDate() : new Date(b.created);
                return dateB - dateA;
            });
            
            setEvents(found);
        } catch (error) {
            console.error("Search error:", error.message);
            setError("Greška pretraživanja");
        } finally {
            setLoading(false);
        }
    }

    // filtrirani događaji po težini
    const filteredEvents = () => {
        if (difficultyFilter() === "all") {
            return events();
        }
        return events().filter(event => event.difficulty === difficultyFilter());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError(null);
        setSuccess(null);

        const userId = authService.getCurrentUser().uid;

        const data = new FormData(e.target);
        const eventData = {
            name: data.get("name"),
            description: data.get("description"),
            datetime: new Date(data.get("datetime")),
            isPrivate: !!data.get("isPrivate"),
            difficulty: data.get("difficulty") || "Beginner",
            userId: userId,
            created: new Date()
        };
        console.log("Event data", eventData);

        try {
            if (selectedEvent()) {
                // ažuriranje
                const docRef = doc(db, "events", selectedEvent().id);
                await updateDoc(docRef, eventData);
                setEvents(
                    events().map((event) => (event.id === selectedEvent().id ? { ...event, ...eventData } : event))
                );
                setSelectedEvent({ ...selectedEvent(), ...eventData });
            } else {
                // dodavanje
                const eventsRef = collection(db, "events");
                const docRef = await addDoc(eventsRef, eventData);
                setEvents([...events(), { id: docRef.id, ...eventData }]);
                e.target.reset();
            }
            setSuccess(selectedEvent() ? "Događaj je uspješno ažuriran" : "Događaj je uspješno dodan");
        } catch (error) {
            console.error("Operation error", error.message);
            setError(selectedEvent() ? "Ažuriranje događaja nije uspjelo" : "Dodavanje događaja nije uspjelo");
        }
    };

    // brisanje
    const handleDelete = async () => {
        if (!confirm("Jeste li sigurni?")) return;

        setError(null);
        setSuccess(null);

        try {
            const docRef = doc(db, "events", selectedEvent().id);
            await deleteDoc(docRef);
            setEvents(events().filter((event) => (event.id !== selectedEvent().id)));
            setSelectedEvent(null);
            formRef.reset();
            setSuccess("Događaj je uspješno obrisan");
        } catch (error) {
            console.error("Delete error", error.message);
            setError("Brisanje nije uspjelo");
        }
    };

    createEffect(() => {
        if (selectedEvent() && formRef) {
            const event = selectedEvent();
            formRef.name.value = event.name;
            formRef.description.value = event.description;
            if (event.datetime) {
                const date = event.datetime.toDate ? event.datetime.toDate() : event.datetime;
                formRef.datetime.value = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
            }
            formRef.isPrivate.checked = event.isPrivate;
            if (event.difficulty) {
                formRef.difficulty.value = event.difficulty;
            }
        }
    });

    // pomoćna funkcija za oblikovanje datuma
    const formatEventDate = (datetime) => {
        if (!datetime) return "Nije zadan datum";
        if (datetime.toDate) return datetime.toDate().toLocaleString();
        if (datetime.toLocaleString) return datetime.toLocaleString();
        return "Nije zadan datum";
    }

    return (
        <>
            <h1 class="text-2xl uppercase tracking-wider mb-4 w-full text-center">
                {selectedEvent() ? "Uređivanje događaja" : "Dodavanje događaja"}
            </h1>

            {/* Pretraživanje */}
            <div class="max-w-2xl m-auto mb-4">
                <div class="join w-full">
                    <input
                        class="input input-bordered join-item w-full"
                        type="text"
                        placeholder="Pretraživanje po nazivu"
                        value={searchTerm()}
                        onInput={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && searchEvents()}
                    />
                    <button class="btn join-item" onClick={searchEvents}>
                        Traži
                    </button>
                </div>
            </div>

            {/* Filter po težini */}
            <div class="max-w-2xl m-auto mb-4">
                <div class="flex gap-2 justify-center flex-wrap">
                    <button 
                        class={`btn btn-sm ${difficultyFilter() === "all" ? "btn-primary" : "btn-outline"}`}
                        onClick={() => setDifficultyFilter("all")}
                    >
                        Sve
                    </button>
                    <For each={difficulties}>
                        {(difficulty) => (
                            <button 
                                class={`btn btn-sm ${difficultyFilter() === difficulty ? "btn-primary" : "btn-outline"}`}
                                onClick={() => setDifficultyFilter(difficulty)}
                            >
                                {difficulty}
                            </button>
                        )}
                    </For>
                </div>
            </div>

            {/* Tijek učitavanja */}
            <Show when={loading()}>
                <div class="flex justify-center">
                    <span class="loading loading-spinner loading-lg"></span>
                </div>
            </Show>

            {/* Prikaz događaja */}
            <Show when={filteredEvents().length > 0}>
                <div class="max-w-2xl m-auto mb-4 space-y-2">
                    <For each={filteredEvents()}>
                        {(event) => (
                            <div
                                class={`card bg-base-200 cursor-pointer hover:bg-base-300 ${selectedEvent()?.id === event.id ? "ring-2 ring-primary" : ""}`}
                                onClick={() => setSelectedEvent(event)}
                            >
                                <div class="card-body p-4">
                                    <div class="flex justify-between items-start">
                                        <h3 class="font-bold">{event.name}</h3>
                                        <span class={`badge ${getDifficultyBadgeClass(event.difficulty)}`}>
                                            {event.difficulty || "Beginner"}
                                        </span>
                                    </div>
                                    <p class="text-sm text-gray-600">
                                        {formatEventDate(event.datetime)}
                                        {event.isPrivate && <span class="badge badge-sm ml-2">Privatan</span>}
                                    </p>
                                </div>
                            </div>
                        )}
                    </For>
                </div>
            </Show>

            <Show when={!loading() && filteredEvents().length === 0 && events().length > 0}>
                <p class="text-center text-gray-600 mb-4">Nema događaja s odabranom težinom</p>
            </Show>

            <Message message={error()} type="error" />
            <Message message={success()} />

            <form class="max-w-2xl m-auto" onSubmit={handleSubmit} ref={formRef}>
                <label class="floating-label mb-1 w-full">
                    <input class="input input-md w-full" type="text" name="name" placeholder="Ime" required />
                    <span>Naziv</span>
                </label>

                <fieldset class="fieldset">
                    <textarea class="textarea h-24 w-full" placeholder="Opis" name="description" required></textarea>
                </fieldset>

                <label class="floating-label mb-1 w-full">
                    <input class="input input-md w-full" type="datetime-local" name="datetime" placeholder="Datum i vrijeme" required />
                    <span>Datum i vrijeme</span>
                </label>

                <fieldset class="fieldset">
                    <label class="label">
                        <span class="label-text">Razina težine</span>
                    </label>
                    <select class="select select-bordered w-full" name="difficulty">
                        <For each={difficulties}>
                            {(difficulty) => (
                                <option value={difficulty}>{difficulty}</option>
                            )}
                        </For>
                    </select>
                </fieldset>

                <fieldset class="fieldset py-2">
                    <label class="label">
                        <input type="checkbox" class="toggle" name="isPrivate" />
                        Privatan događaj
                    </label>
                </fieldset>

                <div class="flex gap-2 justify-between">
                    <Show when={selectedEvent()}>
                        <button type="button" class="btn btn-error" onClick={handleDelete}>
                            Izbriši
                        </button>
                        <button type="button" class="btn btn-ghost"
                            onClick={() => {
                                setSelectedEvent(null);
                                formRef.reset();
                            }}>
                            Odustani
                        </button>
                    </Show>
                    <button type="submit" class="btn btn-primary">
                        {selectedEvent() ? "Spremi" : "Dodaj"}
                    </button>
                </div>
            </form>
        </>
    );
}