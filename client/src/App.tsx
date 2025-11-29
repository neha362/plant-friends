import "./App.css";
import AuthUserProvider from "./auth/AuthUserProvider";
import Login from "./components/CreateLogin";
import Header from "./components/Header";

const App = () => {
  return (
    <div>
      <AuthUserProvider>
        <Header />
        <h1>CoursePlan Clone</h1>
        <Login />
      </AuthUserProvider>
    </div>
  );
};

export default App;