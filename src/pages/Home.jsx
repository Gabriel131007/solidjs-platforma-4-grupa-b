import { createSignal, Show, For, createEffect } from "solid-js";
import { isAuthenticated, authService } from "../services/auth.js";
import { db } from "../lib/firebase.js";
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";

export default function Home() {
    const [events, setEvents] = createSignal([]);
    const [loading, setLoading] = createSignal(false);
    const [favorites, setFavorites] = createSignal([]);
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

    const loadEvents = async () => {
        setLoading(true);
        try {
            const eventsRef = collection(db, "events");
            const q = query(eventsRef, where("isPrivate", "==", false));
            const snapshot = await getDocs(q);
            setEvents(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

            // učitavanje korisnikovih favorita
            if (isAuthenticated()) {
                const userId = authService.getCurrentUser().uid;
                const userFavs = snapshot.docs
                    .filter(doc => doc.data().favorites?.includes(userId))
                    .map(doc => doc.id);
                setFavorites(userFavs);
            }
        } catch (error) {
            console.error("Event load failed", error.message);
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

    // preporuke događaja na osnovu korisnikovih favorita
    const getRecommendations = () => {
        if (favorites().length === 0) return [];

        // pronađi najčešću razinu težine u favoritima
        const favoritedEvents = events().filter(e => favorites().includes(e.id));
        const difficultyCount = {};
        
        favoritedEvents.forEach(event => {
            const diff = event.difficulty || "Beginner";
            difficultyCount[diff] = (difficultyCount[diff] || 0) + 1;
        });

        // pronađi najčešću težinu
        let mostCommonDifficulty = "Beginner";
        let maxCount = 0;
        Object.keys(difficultyCount).forEach(diff => {
            if (difficultyCount[diff] > maxCount) {
                maxCount = difficultyCount[diff];
                mostCommonDifficulty = diff;
            }
        });

        // preporuči događaje s istom težinom koji nisu u favoritima
        return events()
            .filter(event => 
                !favorites().includes(event.id) && 
                event.difficulty === mostCommonDifficulty
            )
            .slice(0, 3);
    };

    const toggleFavorite = async (eventId) => {
        if (!isAuthenticated()) return;

        const userId = authService.getCurrentUser().uid;
        const isFavorite = favorites().includes(eventId);

        try {
            const eventRef = doc(db, "events", eventId);
            await updateDoc(eventRef,
                { favorites: isFavorite ? arrayRemove(userId) : arrayUnion(userId) }
            );
            setFavorites(isFavorite
                ? favorites().filter(id => id !== eventId)
                : [...favorites(), eventId]
            );
            setEvents(events().map(event =>
                event.id === eventId
                    ? {
                        ...event, favorites: isFavorite
                            ? (event.favorites || []).filter(id => id !== userId)
                            : [...(event.favorites || []), userId]
                    }
                    : event
            ));
        } catch (error) {
            console.error("Error toggling favorite", error.message);
        }
    }

    // pomoćna funkcija za oblikovanje datuma
    const formatEventDate = (datetime) => {
        if (!datetime) return "Nije zadan datum";
        if (datetime.toDate) return datetime.toDate().toLocaleString();
        if (datetime.toLocaleString) return datetime.toLocaleString();
        return "Nije zadan datum";
    }

    createEffect(async () => {
        if (isAuthenticated()) {
            await loadEvents();
        }
    });

    const EventCard = (props) => (
        <div class="card bg-base-200 shadow-md">
            <div class="card-body">
                <div class="flex justify-between items-start">
                    <h3 class="card-title">{props.event.name}</h3>
                    <div class="flex gap-2 items-center">
                        <span class={`badge ${getDifficultyBadgeClass(props.event.difficulty)}`}>
                            {props.event.difficulty || "Beginner"}
                        </span>
                        <button class="btn btn-ghost btn-circle btn-sm" onClick={() => toggleFavorite(props.event.id)}>
                            {favorites().includes(props.event.id) ? "💙" : "🤍"}
                        </button>
                    </div>
                </div>
                <p class="text-sm">{props.event.description}</p>
                <p class="text-xs text-gray-600">{formatEventDate(props.event.datetime)}</p>
                <Show when={props.event.favorites?.length > 0}>
                    <p class="text-xs text-gray-500">💙 {props.event.favorites.length}</p>
                </Show>
            </div>
        </div>
    );

    return (
        <>
            <h1 class="text-2xl uppercase tracking-wider mb-4 w-full text-center">Dobro došli na naslovnicu</h1>

            <Show when={!isAuthenticated()}>
                <p class="text-center text-gray-600">Prijavite se kako biste vidjeli događaje</p>
            </Show>

            <Show when={isAuthenticated()}>
                {/* Filter po težini */}
                <div class="max-w-4xl m-auto mb-6">
                    <div class="flex gap-2 justify-center flex-wrap">
                        <button 
                            class={`btn btn-sm ${difficultyFilter() === "all" ? "btn-primary" : "btn-outline"}`}
                            onClick={() => setDifficultyFilter("all")}
                        >
                            Sve razine
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

                {/* Preporuke */}
                <Show when={!loading() && getRecommendations().length > 0}>
                    <div class="max-w-4xl m-auto mb-6">
                        <h2 class="text-xl font-semibold mb-3 flex items-center gap-2">
                            <span>✨</span>
                            <span>Preporučeno za vas</span>
                        </h2>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <For each={getRecommendations()}>
                                {(event) => <EventCard event={event} />}
                            </For>
                        </div>
                    </div>
                </Show>

                <Show when={loading()}>
                    <div class="flex justify-center">
                        <span class="loading loading-spinner loading-lg"></span>
                    </div>
                </Show>

                <Show when={!loading() && events().length === 0}>
                    <p class="text-center text-gray-600">Nema dostupnih događaja</p>
                </Show>

                <Show when={!loading() && filteredEvents().length === 0 && events().length > 0}>
                    <p class="text-center text-gray-600">Nema događaja s odabranom razinom težine</p>
                </Show>

                <Show when={!loading() && filteredEvents().length > 0}>
                    <div class="max-w-4xl m-auto">
                        <h2 class="text-xl font-semibold mb-3">
                            {difficultyFilter() === "all" ? "Svi javni događaji" : `${difficultyFilter()} događaji`}
                        </h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <For each={filteredEvents()}>
                                {(event) => <EventCard event={event} />}
                            </For>
                        </div>
                    </div>
                </Show>
            </Show>
        </>
    );
}