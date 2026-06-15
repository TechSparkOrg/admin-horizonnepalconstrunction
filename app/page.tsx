import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function RootPage() {
  const token = (await cookies()).get("access_token");
  redirect(token ? "/dashboard" : "/login");
}
