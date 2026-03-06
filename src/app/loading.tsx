export default function Loading() {
  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      <p className="text-muted-foreground animate-pulse text-sm">
        جاري تحميل البيانات...
      </p>
    </div>
  )
}