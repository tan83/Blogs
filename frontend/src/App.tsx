import { RouterProvider } from "react-router";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { PostsProvider } from "@/context/PostsContext";
import { AboutProvider } from "@/context/AboutContext";
import { router } from "./routes";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PostsProvider>
          <AboutProvider>
            <RouterProvider router={router} />
          </AboutProvider>
        </PostsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
