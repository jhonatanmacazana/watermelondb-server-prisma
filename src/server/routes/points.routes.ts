import { Request, Router } from "express";

import { prisma } from "#root/db/client";

const pointRouter = Router();

const getSafeLastPulledAt = (request: Request) => {
  const lastPulledAt = request.body["lastPulledAt"];
  if (!lastPulledAt) {
    return new Date(0).toString();
  }
  return new Date(parseInt(lastPulledAt)).toString();
};

pointRouter.get("/sync", async (req, res) => {
  const lastPulledAt = getSafeLastPulledAt(req);

  const created = await prisma.points.findMany({
    where: { createdAt: { gt: lastPulledAt } },
  });
  const updated = await prisma.points.findMany({
    where: { updatedAt: { gt: lastPulledAt } },
  });

  return {
    changes: {
      points: {
        created,
        updated,
        deleted: [],
      },
    },
    timestamp: Date.now(),
  };
});

pointRouter.post("/sync", async (req, res) => {
  const { changes } = req.body;
  if (!changes) {
    return res.status(400).json({ error: "Wrong body" });
  }

  if (changes?.points?.created?.length > 0) {
    const remoteCreatedData = changes.points.created.map(
      (remoteEntry: any) => ({
        note: remoteEntry.note,
        weight: remoteEntry.weight,
        watermelonId: remoteEntry.id,
        createdAt: new Date(parseInt(remoteEntry.created_at)),
      })
    );
    await prisma.points.createMany({ data: remoteCreatedData });
  }

  if (changes?.points?.updated?.length > 0) {
    const updateDataPromises = changes.points.updated.map(
      async (remoteEntry: any) => {
        return prisma.points.update({
          where: { id: remoteEntry.id },
          data: { ...remoteEntry },
        });
      }
    );
    await Promise.all(updateDataPromises);
  }

  if (changes?.points?.deleted?.length > 0) {
    // await Weight.query().where('watermelon_id', changes.weights.deleted).exec()

    // await prisma.points.createMany({ data: remoteCreatedData });
    console.log({ deleted: changes?.points?.deleted });
  }
  return res.status(200).json({ message: "ok", error: null });
});

export { pointRouter };
