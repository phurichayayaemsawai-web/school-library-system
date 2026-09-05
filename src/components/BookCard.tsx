import React from "react";
import { Book } from "@/types";
import { StatusBadge } from "./StatusBadge";
import { ArrowUpRight, Trash2, User, MapPin, Hash, BookOpen } from "lucide-react";
import { useLibrary } from "@/context/LibraryContext";

interface BookCardProps {
  book: Book;
  onBorrow?: (book: Book) => void;
  onView?: (book: Book) => void;
  onDelete?: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onBorrow,
  onView,
  onDelete,
}) => {
  const { isAdmin, deleteBook } = useLibrary();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`คุณต้องการลบหนังสือ "${book.title}" (รหัส ${book.id}) ออกจากระบบหรือไม่?`)) {
      if (onDelete) onDelete(book);
      else deleteBook(book.id);
    }
  };

  return (
    <div className="group bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col hover:-translate-y-1">
      <div
        className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100 cursor-pointer"
        onClick={() => onView && onView(book)}
      >
        <img
          src={book.coverUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://placehold.co/400x600/e2e8f0/0369a1?text=" +
              encodeURIComponent(book.title.slice(0, 12));
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3 sm:p-4">
          <span className="text-[11px] sm:text-xs text-white font-medium flex items-center gap-1">
            ดูรายละเอียด <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
          <StatusBadge status={book.status} type="book" />
          {isAdmin && (
            <button
              onClick={handleDelete}
              title="ลบหนังสือเล่มนี้"
              className="p-1 rounded-md bg-rose-600/90 hover:bg-rose-700 text-white backdrop-blur-xs transition-colors shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="absolute top-2.5 left-2.5">
          <span className="text-[10px] font-mono font-bold bg-slate-900/85 text-white px-2 py-0.5 rounded-md backdrop-blur-xs shadow-2xs whitespace-nowrap">
            {book.id}
          </span>
        </div>
      </div>

      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] sm:text-xs font-semibold text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded-md inline-block mb-1.5 border border-blue-100 truncate max-w-full">
            {book.category}
          </span>
          <h3
            className="font-bold text-slate-800 text-xs sm:text-sm leading-snug line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer"
            onClick={() => onView && onView(book)}
            title={book.title}
          >
            {book.title}
          </h3>
          <div className="mt-2 space-y-1 text-[11px] sm:text-xs text-slate-500">
            <div className="flex items-center gap-1.5 truncate">
              <User className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <span className="truncate">{book.author}</span>
            </div>
            {book.location && (
              <div className="flex items-center gap-1.5 text-slate-500 truncate">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                <span className="truncate">{book.location}</span>
              </div>
            )}
            {book.isbn && (
              <div className="flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px] text-slate-400 truncate">
                <Hash className="w-3 h-3 shrink-0" />
                <span className="truncate">ISBN: {book.isbn}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
          <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-sky-800 bg-sky-50/90 px-2 py-0.5 rounded-lg border border-sky-200/80 whitespace-nowrap">
            ยืมแล้ว {book.totalBorrowedCount || 0} ครั้ง
          </span>
          {book.status === "AVAILABLE" ? (
            <button
              onClick={() => onBorrow && onBorrow(book)}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] sm:text-xs font-semibold shadow-xs hover:shadow transition-all flex items-center gap-1 whitespace-nowrap"
            >
              <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span>ยืมเล่มนี้</span>
            </button>
          ) : (
            <span className="text-[10px] sm:text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100 whitespace-nowrap">
              กำลังถูกยืม
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
