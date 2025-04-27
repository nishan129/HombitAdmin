import { useEffect, useState } from "react"; 
import { Button } from "./components/ui/button";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1>Welcome to My App</h1>
      <p>Current Count: {count}</p>
      <Button onClick={() => setCount(count + 1)}>Increase Count</Button>
    </>
  );
}

export default App;
