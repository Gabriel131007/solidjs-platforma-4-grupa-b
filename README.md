# 🎮 Platforma za Recenzije Video Igara

**Tema:** Recenzije video igara

---

## 1. Opis projekta

### Što aplikacija rješava?

GameCrit je web aplikacija namijenjena svim ljubiteljima video igara koji žele dijeliti svoja mišljenja, čitati tuđe recenzije i pratiti što drugi igraju. U moru gaming sadržaja na internetu, korisnici često ne znaju jesu li neke igre vrijedne njihovog vremena i novca — recenzije profesionalnih novinara često zvuče odvojeno od stvarnog iskustva prosječnog igrača, a komentari na društvenim mrežama su kaotični i nepregledni.

GameCrit rješava taj problem stvaranjem jednostavne, pregledne i personalizirane platforme za korisničke recenzije. Za razliku od velikih portala poput Metacritica ili IGN-a, GameCrit je zajednica u kojoj obični igrači — a ne profesionalni kritičari — pišu iskrene recenzije iz perspektive stvarnih korisnika. Svaki registrirani korisnik može pretražiti igru, dodati recenziju, ocijeniti je ocjenom od 1 do 10 te pročitati što drugi misle o istom naslovu. Aplikacija automatski izračunava prosječnu korisničku ocjenu na temelju svih dostavljenih recenzija i prikazuje je vidljivo uz svaku igru.

Jedan od ključnih ciljeva aplikacije je jednostavnost i brzina korištenja. Korisnik ne treba prolaziti kroz složene procese — u par klikova pronalazi igru koja ga zanima, vidi ukupnu ocjenu zajednice i može pročitati što je svaki recenzent posebno istaknuo kao prednost ili manu. Svaka recenzija se može strukturirati u dva dijela: pozitivne strane (PRO) i negativne strane (CON), što čitatelju odmah daje jasan pregled bez čitanja cijelog teksta.

Aplikacija je zamišljena kao zajednica temeljena na povjerenju, gdje korisnici mogu pratiti što su sami odigrali, filtrirati igre po žanru ili prosječnoj ocjeni te imati vlastiti profil s poviješću recenzija. Time GameCrit postaje i osobni gaming dnevnik i društvena platforma u jednom.

### Tko su korisnici?

Primarna ciljana skupina su mladi igrači između 14 i 30 godina koji redovito igraju video igre i žele dijeliti iskustva s drugima. To su osobe koje su umorile od reklamnih ocjena na velikim portalima i traže autentično mišljenje stvarnih igrača. Njima je bitno da mogu brzo pronaći igru, vidjeti ocjenu i pročitati kratku, jasnu recenziju — bez puno nepotrebnog sadržaja oko nje.

Sekundarni korisnici su administratori platforme koji upravljaju sadržajem i korisnicima te moderiraju potencijalno neprimjerene recenzije. Administrator ima poseban pristup koji mu omogućuje brisanje recenzija, upravljanje popisom igara u bazi i pregled korisničkih računa.

Ukupno, aplikacija razlikuje tri tipa korisnika:
- **Gosti** — mogu pregledavati igre i recenzije bez registracije, ali ne mogu pisati recenzije
- **Registrirani korisnici** — mogu pisati, uređivati i brisati vlastite recenzije te upravljati profilom
- **Administratori** — imaju ovlasti brisati bilo koju recenziju, upravljati igrama i korisnicima

### Zašto ova tematika?

Video igre su jedan od najbrže rastućih oblika zabave na svijetu s godišnjim prihodom koji premašuje filmsku i glazbenu industriju zajedno. Gotovo svaki mlađi čovjek ima iskustvo s video igrama, a mnogi ih igraju svakodnevno — što ovu platformu čini relevantnom za veliku skupinu korisnika. Unatoč tomu, kvalitetnih platformi za korisničke recenzije na regionalnom govornom području gotovo nema.

Odabrana tematika je osobno bliska i motivirajuća za rad. Tehnički je dovoljno zahtjevna za primjenu svih traženih tehnologija — autentifikacija, CRUD operacije, korisničke uloge, responzivni dizajn — a istovremeno je dovoljno jasno omeđena da se može realno završiti u zadanom roku od 20 školskih sati. Podaci su strukturirani (igre, korisnici, recenzije), što je savršeno za vježbu modeliranja Firestore baze.

Aplikacija GameCrit nije samo tehnički projekt — ona ima stvarnu svrhu i mogla bi se koristiti kao pravi alat unutar gaming zajednice. Upravo ta kombinacija tehničke relevantnosti i stvarne korisnosti čini je idealnom temom za završni projekt.

---

## 2. Tablica funkcionalnosti

### Osnovne mogućnosti

- [ ] Registracija korisnika (email + lozinka putem Firebase Auth)
- [ ] Prijava i odjava
- [ ] Oporavak zaporke (reset link na email)
- [ ] Pregled popisa igara
- [ ] Stranica detalja igre s opisom i recenzijama
- [ ] Dodavanje recenzije (ocjena 1–10 + tekst)
- [ ] Uređivanje vlastite recenzije
- [ ] Brisanje vlastite recenzije
- [ ] Automatski izračun prosječne ocjene igre
- [ ] Korisnički profil (pregled i uređivanje podataka)
- [ ] Uloge korisnika (user / admin)
- [ ] Admin: brisanje bilo koje recenzije
- [ ] Admin: dodavanje igara u bazu
- [ ] Responzivni dizajn (mobitel i računalo)
- [ ] Objava putem Firebase Hostinga

### Napredne mogućnosti

- [ ] Pretraživanje igara po imenu (live search)
- [ ] Filtriranje po žanru (FPS, RPG, Akcija...)
- [ ] PRO/CON struktura recenzije
- [ ] Glasanje je li recenzija bila korisna
- [ ] Označavanje igara kao "Igram / Odigrao"
- [ ] Sortiranje recenzija po datumu ili ocjeni
- [ ] Admin nadzorna ploča sa statistikama

---

## 3. Scenariji korištenja

### Scenarij 1 — Gost čita recenzije

1. Korisnik otvara aplikaciju i vidi naslovnicu s istaknutim igrama
2. Pregledava popis igara ili koristi pretraživanje
3. Klika na igru i otvara se stranica s opisom i recenzijama
4. Čita recenzije i vidi prosječnu ocjenu zajednice
5. Bez registracije ne može pisati recenziju — prikazuje mu se poziv na registraciju

### Scenarij 2 — Registracija i prva recenzija

1. Korisnik klikne "Registracija" u navigaciji
2. Unosi email i lozinku — Firebase kreira račun
3. Automatski je prijavljen i preusmjeren na naslovnicu
4. Pronalazi igru i klikne "Napiši recenziju"
5. Popunjava formu: ocjena (1–10) i tekst recenzije
6. Potvrđuje — recenzija se sprema u Firestore
7. Recenzija je odmah vidljiva, prosječna ocjena se ažurira

### Scenarij 3 — Uređivanje i brisanje recenzije

1. Prijavljeni korisnik otvara stranicu igre
2. Uz vlastitu recenziju vidi gumbe "Uredi" i "Obriši"

Uređivanje:
3. Klikne "Uredi" — forma se popunjava trenutnim sadržajem
4. Mijenja ocjenu ili tekst i sprema
5. Recenzija i prosječna ocjena se ažuriraju

Brisanje:
3. Klikne "Obriši" — pojavljuje se modal za potvrdu
4. Potvrđuje brisanje — recenzija je uklonjena
5. Prosječna ocjena se automatski preračunava

### Scenarij 4 — Oporavak zaboravljene lozinke

1. Korisnik klikne "Prijava" pa "Zaboravili ste lozinku?"
2. Unosi email adresu i potvrđuje
3. Firebase šalje reset email
4. Korisnik otvara email i klikne link za reset
5. Unosi novu lozinku i prijavljuje se normalno

### Scenarij 5 — Administrator moderira sadržaj

1. Admin se prijavljuje s admin računom
2. U navigaciji mu se pojavljuju admin opcije
3. U admin panelu može pregledati i obrisati neprimjerene recenzije
4. Može dodati novu igru popunjavanjem forme (naslov, opis, žanr, godina)
5. Može pregledati popis svih korisnika
6. Sve promjene su odmah vidljive svim korisnicima

---

## 4. Struktura baze podataka (Firestore)

Kolekcija users:
- email (string)
- displayName (string)
- role — "user" ili "admin" (string)
- createdAt (timestamp)
- avatarUrl (string, opcionalno)

Kolekcija games:
- title (string)
- description (string)
- genre (string)
- releaseYear (number)
- coverUrl (string)
- averageRating (number) — automatski se ažurira uz svaku recenziju
- reviewCount (number)

Kolekcija reviews:
- gameId (string) — referenca na igru
- userId (string) — referenca na korisnika
- authorName (string)
- rating (number, 1–10)
- text (string)
- createdAt (timestamp)
- updatedAt (timestamp)

---

## 5. Vizualni prototip


Prototip prikazuje:
- Naslovnicu s hero sekcijom i gridом igara
- Stranicu igre s opisom, prosječnom ocjenom i recenzijama
- Formu za pisanje recenzije
- Profil korisnika s vlastitim recenzijama
- Stranicu prijave i registracije
- Admin panel s tablicama recenzija i korisnika


Tablica funkcionalnosti ažurirat će se po završetku svake faze.
