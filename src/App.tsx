import "./App.css";
import { Provider } from "react-redux";
import { store } from "./store/store";
import Dashboard from "./components/DashBoard";

function App() {
  return (
    <>
      <Provider store={store}>
        <Dashboard />
      </Provider>
    </>
  );
}

export default App;
