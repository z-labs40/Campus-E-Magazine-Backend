import "reflect-metadata";
import bcrypt from "bcrypt";
import { AppDataSource } from "../infrastructure/database";
import { User } from "../adapters/models/User";
import { Magazine } from "../adapters/models/Magazine";
import { Logger } from "../shared/logger";

async function seed() {
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);
  const magazineRepo = AppDataSource.getRepository(Magazine);

  const adminEmail = "admin@campus.edu";
  let admin = await userRepo.findOne({ where: { email: adminEmail } });

  if (!admin) {
    admin = userRepo.create({
      email: adminEmail,
      name: "Campus Admin",
      password: await bcrypt.hash("admin123", 10),
      role: "admin",
    });
    await userRepo.save(admin);
    Logger.info(`Created admin: ${adminEmail} / admin123`);
  }

  const readerEmail = "reader@campus.edu";
  let reader = await userRepo.findOne({ where: { email: readerEmail } });

  if (!reader) {
    reader = userRepo.create({
      email: readerEmail,
      name: "Sample Reader",
      password: await bcrypt.hash("reader123", 10),
      role: "reader",
    });
    await userRepo.save(reader);
    Logger.info(`Created reader: ${readerEmail} / reader123`);
  }

  const count = await magazineRepo.count();
  if (count === 0) {
    const sample = magazineRepo.create({
      title: "Spring 2026 Edition",
      coverImage: "https://picsum.photos/seed/magazine/400/600",
      content: `<article>
<h1>Welcome to Campus E-Magazine</h1>
<p>This is the inaugural digital edition. Readers can highlight any passage and suggest edits.</p>
<p>Our editorial team reviews every suggestion before merging changes into the published edition.</p>
</article>`,
      status: "published",
      createdById: admin.id,
    });
    await magazineRepo.save(sample);
    Logger.info("Created sample magazine edition");
  }

  await AppDataSource.destroy();
  Logger.info("Seed completed");
}

seed().catch((err) => {
  Logger.error(`Seed failed: ${err}`);
  process.exit(1);
});
