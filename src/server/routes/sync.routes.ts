import { Request, Router } from "express";

import { prisma } from "#root/db/client";

const syncRouter = Router();

const getSafeLastPulledAt = (request: Request) => {
  const lastPulledAt = request.query.lastPulledAt as string;
  if (!lastPulledAt) {
    return new Date(0);
  }
  return new Date(parseInt(lastPulledAt));
};

syncRouter.get("/", async (req, res) => {
  const lastPulledAt = getSafeLastPulledAt(req);
  console.log(lastPulledAt, req.query.lastPulledAt);

  const created = await prisma.points.findMany({
    where: { createdAt: { gt: lastPulledAt } },
  });
  const updated = await prisma.points.findMany({
    where: { updatedAt: { gt: lastPulledAt } },
  });

  const returnObject = {
    changes: {
      points: {
        created,
        updated,
        deleted: [],
      },
    },
    timestamp: Date.now(),
  };

  console.log(returnObject);

  return res.json(returnObject);
});

syncRouter.post("/", async (req, res) => {
  const { changes } = req.body;
  if (!changes) {
    return res.status(400).json({ error: "Wrong body" });
  }
  const lastPulledAt = getSafeLastPulledAt(req);
  console.log(lastPulledAt, req.query.lastPulledAt);
  console.log("changes", changes);

  if (changes?.points?.created?.length > 0) {
    const remoteCreatedData = changes.points.created.map((remoteEntry: any) => ({
      id: remoteEntry.id,
      accuracy: remoteEntry.accuracy,
      altitude: remoteEntry.altitude,
      latitude: remoteEntry.latitude,
      longitude: remoteEntry.longitude,
      course: remoteEntry.course,
      heading: remoteEntry.heading,
      speed: remoteEntry.speed,
      createdAt: new Date(parseInt(remoteEntry.created_at)),
    }));
    await prisma.points.createMany({ data: remoteCreatedData });
  }

  if (changes?.points?.updated?.length > 0) {
    const updateDataPromises = changes.points.updated.map(async (remoteEntry: any) => {
      return prisma.points.update({
        where: { id: remoteEntry.id },
        data: {
          accuracy: remoteEntry.accuracy,
          altitude: remoteEntry.altitude,
          latitude: remoteEntry.latitude,
          longitude: remoteEntry.longitude,
          course: remoteEntry.course,
          heading: remoteEntry.heading,
          speed: remoteEntry.speed,
        },
      });
    });
    await Promise.all(updateDataPromises);
  }

  if (changes?.points?.deleted?.length > 0) {
    // await Weight.query().where('watermelon_id', changes.weights.deleted).exec()

    // await prisma.points.createMany({ data: remoteCreatedData });
    console.log({ deleted: changes?.points?.deleted });
  }
  return res.status(200).json({ message: "ok", error: null });
});

export { syncRouter };
