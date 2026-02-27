import bcrypt from "bcrypt";
import { prisma } from "../src/app/shared/prisma";
import { FileType } from "@prisma/client";

async function main() {
  console.log("Seeding database...");

  const adminEmail = "admin@saas.com";
  const adminPassword = "123456";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    await prisma.user.create({
      data: {
        name: "Super Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    console.log("Admin created");
  } else {
    console.log("Admin already exists");
  }

  const packages = [
    {
      name: "Free",
      maxFolders: 2,
      maxLevels: 2,
      allowedFileType: [FileType.IMAGE, FileType.PDF],
      maxFileSizeMB: 5,
      fileLimit: 5,
      filesPerFolder: 2,
    },
    {
      name: "Silver",
      maxFolders: 3,
      maxLevels: 3,
      allowedFileType: [FileType.IMAGE, FileType.PDF, FileType.AUDIO],
      maxFileSizeMB: 10,
      fileLimit: 10,
      filesPerFolder: 3,
    },
    {
      name: "Gold",
      maxFolders: 4,
      maxLevels: 4,
      allowedFileType: [
        FileType.IMAGE,
        FileType.PDF,
        FileType.AUDIO,
        FileType.VIDEO,
      ],
      maxFileSizeMB: 20,
      fileLimit: 20,
      filesPerFolder: 4,
    },
    {
      name: "Diamond",
      maxFolders: 5,
      maxLevels: 5,
      allowedFileType: [
        FileType.IMAGE,
        FileType.PDF,
        FileType.AUDIO,
        FileType.VIDEO,
      ],
      maxFileSizeMB: 25,
      fileLimit: 25,
      filesPerFolder: 5,
    },
  ];

  for (const pkg of packages) {
    await prisma.subscriptionPackage.upsert({
      where: { name: pkg.name },
      update: {},
      create: pkg,
    });
    console.log(`${pkg.name} package created`);
  }

  console.log("Seeding completed successfully");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
