import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "../db";
import { adminUsers } from "@shared/schema";

async function main() {
    const email = process.argv[2];
    const password = process.argv[3];
    const name = process.argv[4] ?? "Admin";
    const role = (process.argv[5] ?? "super_admin") as "admin" | "super_admin";

    if (!email || !password) {
        console.log("Uso: npx tsx server/scripts/create-admin.ts <email> <senha> [nome] [role]");
        process.exit(1);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await db.insert(adminUsers).values({
        email,
        passwordHash,
        name,
        role,
    });

    console.log("✅ Admin criado:", email);
    process.exit(0);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
