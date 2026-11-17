export default async function fetchDishVerifyMarkdown(dishId) {
  const res = await fetch(`/__/dish-verify/${dishId}`, {
    credentials: "include",
  });
  if (res.status === 404) {
    return { markdown: null, file: null };
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      body.message || `Failed to load verify markdown (${res.status})`
    );
  }
  return res.json();
}
