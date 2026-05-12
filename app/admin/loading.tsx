import { Skeleton } from "@/components/ui/skeleton"

export default function AdminLoading() {
  return (
    <main className="flex min-h-svh flex-col gap-6 p-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-[32rem] rounded-lg" />
    </main>
  )
}
