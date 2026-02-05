import { Suspense } from "react";
import MainPage from "./main-page";


export default function Page() {
  return (
    <Suspense fallback={null}>
      <MainPage />
    </Suspense>
  );
}
