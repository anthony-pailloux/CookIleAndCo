import { useEffect } from "react";
import { getCurrentUser, login } from "../services/authServices";

function DemoPage() {
  useEffect(() => {
    async function testCurrentUser() {
      try {
        const user = await getCurrentUser();
        console.log("connecter:", user);
      } catch (error) {
        console.log("pas de session:", error.message);
      }
    }
    testCurrentUser();
  }, []);

  return (
    <main>
      <h1>Page demo</h1>
      <p>test routeur</p>
    </main>
  );
}

export default DemoPage;
