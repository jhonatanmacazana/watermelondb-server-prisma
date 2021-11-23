const asyncWrapper = async <TData, TError extends Error>(promise: Promise<TData>) => {
  try {
    const res = await promise;
    return [res, null] as const;
  } catch (err) {
    return [null, err as TError] as const;
  }
};

export default asyncWrapper;
