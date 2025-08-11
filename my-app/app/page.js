import Link from "next/link";

export default function Home() {
  return (
    <main className="flex justify-center items-center w-screen h-screen">
      <ul>
        <li className="hover:underline italic">
          <Link href="/auth/">Go to LogIn Page</Link>
        </li>
        <li className="hover:underline italic">
          <Link href="/inventory">Go to Inventory Page</Link>
        </li>
      </ul>
    </main>
  );
}
