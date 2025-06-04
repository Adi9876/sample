import useSWR from "swr";

const fetcher = async (url) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }
  return res.json();
};

export function useUser() {
  const { data, error, isLoading, mutate } = useSWR("/api/auth/me", fetcher);

  return {
    user: data,
    isLoading,
    isError: error,
    mutate,
  };
}
