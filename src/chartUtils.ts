export const tupleToDataset = (data: [any, number][], label: string) => {
  return {
    labels: data.map((t) => t[0]),
    datasets: [{ data: data.map((t) => t[1]), label }],
  };
};

export const defaultBgColor = "#9966FF";
