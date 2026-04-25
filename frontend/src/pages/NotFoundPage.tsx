import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 animated-gradient-bg">
      <div className="text-center max-w-md">
        <div className="font-display text-7xl md:text-8xl font-bold gradient-text mb-3">
          404
        </div>
        <h1 className="font-display text-2xl font-bold mb-2">
          Page not found
        </h1>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or was moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button asChild>
            <Link to="/">Go home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/dashboard">Open dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
