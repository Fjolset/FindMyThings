import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import { BottomNav } from "./components/BottomNav";
import { Home } from "./pages/Home";
import { PlaceItem } from "./pages/PlaceItem";
import { FindItem } from "./pages/FindItem";
import { AllItems } from "./pages/AllItems";
import { ItemDetail } from "./pages/ItemDetail";
import { Settings } from "./pages/Settings";
import { useEffect } from "react";
import { itemStore } from "./services/storage/itemStore";
import { settingsStore } from "./services/storage/settingsStore";
import { DEMO_ITEMS } from "./data/demoItems";

function AppRoutes() {
  const location = useLocation();
  // Voice flows manage their own microphone lifecycle; leaving the route
  // should always stop any lingering recognition/speech.
  useEffect(() => {
    window.speechSynthesis?.cancel();
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/place" element={<PlaceItem />} />
      <Route path="/find" element={<FindItem />} />
      <Route path="/items" element={<AllItems />} />
      <Route path="/items/:id" element={<ItemDetail />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}

function App() {
  useEffect(() => {
    (async () => {
      const settings = await settingsStore.get();
      if (settings.demoDataEnabled) {
        const existing = await itemStore.getAll();
        if (existing.length === 0) {
          await itemStore.bulkPut(DEMO_ITEMS);
        }
      }
    })();
  }, []);

  return (
    <HashRouter>
      <div className="min-h-screen pb-20">
        <AppRoutes />
      </div>
      <BottomNav />
    </HashRouter>
  );
}

export default App;
