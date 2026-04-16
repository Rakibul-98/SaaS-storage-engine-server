import bcrypt from "bcrypt";
import { prisma } from "../src/app/shared/prisma";
import { FileType } from "@prisma/client";

async function main() {
  console.log("🌱 Seeding database...");

  // ── Subscription packages ──────────────────────────────────────────────────
  const packages = [
    {
      name: "Free",
      maxFolders: 2,
      maxLevels: 2,
      allowedFileType: [FileType.IMAGE, FileType.PDF],
      maxFileSizeMB: 5,
      storageQuotaMB: 100,
      fileLimit: 5,
      filesPerFolder: 2,
    },
    {
      name: "Silver",
      maxFolders: 5,
      maxLevels: 3,
      allowedFileType: [
        FileType.IMAGE,
        FileType.PDF,
        FileType.AUDIO,
        FileType.DOCUMENT,
      ],
      maxFileSizeMB: 10,
      storageQuotaMB: 500,
      fileLimit: 20,
      filesPerFolder: 5,
    },
    {
      name: "Gold",
      maxFolders: 15,
      maxLevels: 4,
      allowedFileType: [
        FileType.IMAGE,
        FileType.PDF,
        FileType.AUDIO,
        FileType.VIDEO,
        FileType.DOCUMENT,
      ],
      maxFileSizeMB: 25,
      storageQuotaMB: 2048,
      fileLimit: 50,
      filesPerFolder: 10,
    },
    {
      name: "Diamond",
      maxFolders: 50,
      maxLevels: 5,
      allowedFileType: [
        FileType.IMAGE,
        FileType.PDF,
        FileType.AUDIO,
        FileType.VIDEO,
        FileType.DOCUMENT,
        FileType.OTHER,
      ],
      maxFileSizeMB: 100,
      storageQuotaMB: 10240,
      fileLimit: 200,
      filesPerFolder: 50,
    },
  ];

  for (const pkg of packages) {
    await prisma.subscriptionPackage.upsert({
      where: { name: pkg.name },
      update: { storageQuotaMB: pkg.storageQuotaMB },
      create: pkg,
    });
    console.log(`  ✅ Package: ${pkg.name}`);
  }

  // ── Admin user ─────────────────────────────────────────────────────────────
  const adminEmail = "admin@saas.com";
  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existing) {
    const hash = await bcrypt.hash("Admin@12345", 12);
    await prisma.user.create({
      data: {
        name: "Super Admin",
        email: adminEmail,
        password: hash,
        role: "ADMIN",
        isVerified: true,
      },
    });
    console.log("  ✅ Admin created (admin@saas.com / Admin@12345)");
  } else {
    console.log("  ℹ️  Admin already exists");
  }

  // ── Demo user ──────────────────────────────────────────────────────────────
  const demoEmail = "demo@saas.com";
  const existingDemo = await prisma.user.findUnique({
    where: { email: demoEmail },
  });

  let demoUser = existingDemo;

  if (!demoUser) {
    const hash = await bcrypt.hash("Demo@12345", 12);
    demoUser = await prisma.user.create({
      data: {
        name: "Demo User",
        email: demoEmail,
        password: hash,
        role: "USER",
        isVerified: true,
      },
    });
    console.log("  ✅ Demo user created (demo@saas.com / Demo@12345)");
  } else {
    console.log("  ℹ️  Demo user already exists");
  }

  // ── Give demo user Gold subscription if they don't have one ───────────────
  const goldPkg = await prisma.subscriptionPackage.findUnique({
    where: { name: "Gold" },
  });

  const existingActiveSub = await prisma.userSubscription.findFirst({
    where: { userId: demoUser!.id, isActive: true },
  });

  if (!existingActiveSub && goldPkg) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 10); // Long expiry for demo

    await prisma.userSubscription.create({
      data: {
        userId: demoUser!.id,
        packageId: goldPkg.id,
        startDate,
        endDate,
        isActive: true,
      },
    });
    console.log("  ✅ Demo user subscribed to Gold plan");
  }

  // ── Demo folders ───────────────────────────────────────────────────────────
  const existingFolders = await prisma.folder.count({
    where: { userId: demoUser!.id, isDeleted: false },
  });

  if (existingFolders === 0) {
    const rootFolder = await prisma.folder.create({
      data: { name: "My Documents", userId: demoUser!.id, depthLevel: 1 },
    });
    const imgFolder = await prisma.folder.create({
      data: { name: "Images", userId: demoUser!.id, depthLevel: 1 },
    });
    const workFolder = await prisma.folder.create({
      data: { name: "Work Files", userId: demoUser!.id, depthLevel: 1 },
    });
    await prisma.folder.create({
      data: {
        name: "Reports",
        userId: demoUser!.id,
        parentId: rootFolder.id,
        depthLevel: 2,
      },
    });
    await prisma.folder.create({
      data: {
        name: "Archive",
        userId: demoUser!.id,
        parentId: workFolder.id,
        depthLevel: 2,
      },
    });

    console.log("  ✅ Demo folders created");

    // ── Demo files (metadata only — no actual Cloudinary uploads in seed) ────
    const demoFiles = [
      {
        name: "project-proposal.pdf",
        type: FileType.PDF,
        size: 245760,
        folderId: rootFolder.id,
        mimeType: "application/pdf",
        path: "https://res.cloudinary.com/demo/raw/upload/sample.pdf",
        aiTags: ["proposal", "project", "business", "2024"],
        aiSummary:
          "A project proposal outlining scope, timeline, and budget for a new software platform.",
      },
      {
        name: "team-photo.jpg",
        type: FileType.IMAGE,
        size: 1024000,
        folderId: imgFolder.id,
        mimeType: "image/jpeg",
        path: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        thumbnailUrl:
          "https://res.cloudinary.com/demo/image/upload/c_fill,h_300,w_300/sample.jpg",
        aiTags: ["team", "people", "office", "group", "photo"],
        aiSummary: null,
      },
      {
        name: "budget-2024.pdf",
        type: FileType.PDF,
        size: 512000,
        folderId: workFolder.id,
        mimeType: "application/pdf",
        path: "https://res.cloudinary.com/demo/raw/upload/sample.pdf",
        aiTags: ["budget", "finance", "2024", "spreadsheet"],
        aiSummary:
          "Annual budget document covering Q1–Q4 departmental allocations and projected expenditures.",
      },
      {
        name: "logo-design.png",
        type: FileType.IMAGE,
        size: 204800,
        folderId: imgFolder.id,
        mimeType: "image/png",
        path: "https://res.cloudinary.com/demo/image/upload/sample.png",
        thumbnailUrl:
          "https://res.cloudinary.com/demo/image/upload/c_fill,h_300,w_300/sample.png",
        aiTags: ["logo", "design", "branding", "graphic"],
        aiSummary: null,
      },
    ];

    for (const f of demoFiles) {
      await prisma.file.create({
        data: { ...f, userId: demoUser!.id },
      });
    }

    // ── Demo activity log ──────────────────────────────────────────────────
    const createdFiles = await prisma.file.findMany({
      where: { userId: demoUser!.id },
    });
    for (const file of createdFiles) {
      await prisma.activityLog.create({
        data: {
          userId: demoUser!.id,
          fileId: file.id,
          action: "UPLOAD" as any,
          metadata: { fileName: file.name, size: file.size },
          createdAt: new Date(
            Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000),
          ),
        },
      });
    }
    console.log("  ✅ Demo files + activity log created");
  } else {
    console.log("  ℹ️  Demo content already exists");
  }

  console.log("\n🎉 Seeding completed successfully!\n");
  console.log("  Admin:  admin@saas.com  /  Admin@12345");
  console.log("  Demo:   demo@saas.com   /  Demo@12345\n");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
