import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export function Component() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <div className="max-w-2xl w-full px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <h1 className="text-4xl font-bold text-center">Endless Chain Story</h1>
        <div className="bg-card rounded-md shadow-sm overflow-hidden">
          <div className="px-6 py-4">
            <p className="text-muted-foreground text-sm">The ongoing story so far:</p>
            <div className="mt-2 prose text-foreground max-w-none">
              <p>
                Once upon a time, in a land far, far away, there lived a curious little rabbit who loved to explore the
                enchanted forest.
              </p>
            </div>
          </div>
          <div className="bg-muted px-6 py-4">
            <Textarea
              className="w-full resize-none border-none focus:ring-0 focus:outline-none"
              placeholder="Add your sentence to the story..."
              rows={2}
            />
          </div>
          <div className="px-6 py-4 flex justify-end">
            <Button>Submit</Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Help build an endless chain story one sentence at a time.
        </p>
      </div>
    </div>
  )
}
