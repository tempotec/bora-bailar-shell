import { db } from "./db";
import { users, venues, events } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  const [demoUser] = await db.insert(users).values({
    id: "demo-user",
    name: "Usuario Demo",
    email: "demo@borabailar.com",
    bio: "Conta de demonstracao do BoraBailar",
    avatarInitials: "UD",
  }).returning();

  console.log("Created demo user:", demoUser.name);

  const [user1] = await db.insert(users).values({
    name: "Ana Costa",
    email: "ana@borabailar.com",
    bio: "Amante de salsa e forro. Sempre procurando a proxima festa!",
    avatarInitials: "AC",
  }).returning();

  console.log("Created user:", user1.name);

  const venueData = [
    { name: "Club Havana", address: "Rua das Flores, 123 - Centro", eventsCount: 12 },
    { name: "Espaco Nordeste", address: "Av. Brasil, 456 - Pinheiros", eventsCount: 8 },
    { name: "Bar do Samba", address: "Rua Augusta, 789 - Consolacao", eventsCount: 15 },
    { name: "Dance Studio", address: "Rua Oscar Freire, 321 - Jardins", eventsCount: 6 },
  ];

  const createdVenues = await db.insert(venues).values(venueData).returning();
  console.log("Created venues:", createdVenues.length);

  const eventData = [
    {
      title: "Noite Latina",
      description: "Uma noite inesquecivel de ritmos latinos! Venha dancar salsa, bachata, merengue e muito mais. DJ internacional e aula de danca incluida. Dress code: casual elegante.",
      venueName: "Club Havana",
      address: "Rua das Flores, 123 - Centro",
      date: "Sab, 14 Dez",
      time: "22:00",
      endTime: "04:00",
      price: "R$ 40,00",
      attendeesCount: 234,
      isFeatured: true,
    },
    {
      title: "Forrozada",
      description: "O melhor do forro pe de serra com banda ao vivo. Traga sua sanfona ou venha so dancar!",
      venueName: "Espaco Nordeste",
      address: "Av. Brasil, 456 - Pinheiros",
      date: "Dom, 15 Dez",
      time: "18:00",
      endTime: "23:00",
      price: "R$ 30,00",
      attendeesCount: 156,
      isFeatured: false,
    },
    {
      title: "Samba Rock",
      description: "Noite classica de samba rock com os melhores DJs da cena. Vista-se para impressionar!",
      venueName: "Bar do Samba",
      address: "Rua Augusta, 789 - Consolacao",
      date: "Sex, 20 Dez",
      time: "21:00",
      endTime: "03:00",
      price: "R$ 25,00",
      attendeesCount: 89,
      isFeatured: false,
    },
    {
      title: "Zouk Night",
      description: "Aula de zouk brasileiro seguida de festa. Todos os niveis sao bem-vindos!",
      venueName: "Dance Studio",
      address: "Rua Oscar Freire, 321 - Jardins",
      date: "Sab, 21 Dez",
      time: "20:00",
      endTime: "02:00",
      price: "R$ 35,00",
      attendeesCount: 178,
      isFeatured: false,
    },
    {
      title: "Baile Funk",
      description: "O melhor do funk carioca com MC's convidados. Dresscode: esportivo.",
      venueName: "Club Havana",
      address: "Rua das Flores, 123 - Centro",
      date: "Sex, 27 Dez",
      time: "23:00",
      endTime: "05:00",
      price: "R$ 50,00",
      attendeesCount: 312,
      isFeatured: true,
    },
    {
      title: "Tango Milonga",
      description: "Noite tradicional de tango argentino. Aula de tango as 20h, milonga as 21h30.",
      venueName: "Dance Studio",
      address: "Rua Oscar Freire, 321 - Jardins",
      date: "Sab, 28 Dez",
      time: "20:00",
      endTime: "01:00",
      price: "R$ 45,00",
      attendeesCount: 67,
      isFeatured: false,
    },
  ];

  const createdEvents = await db.insert(events).values(eventData).returning();
  console.log("Created events:", createdEvents.length);

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
