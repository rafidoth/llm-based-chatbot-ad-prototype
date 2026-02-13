import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function Home() {
  const sessionData = await getSession();

  if (sessionData) {
    redirect("/chat");
  } else {
    redirect("/login");
  }
}
