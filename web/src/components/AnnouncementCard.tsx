import { Pin } from 'lucide-react';
import type { Announcement } from '@shared/model';
import { bangkokDateParts, thaiLongDate } from '@shared/thai';
import { Poster } from './Poster';
import { cn } from './ui';

/** ประกาศหนึ่งรายการ — มีโปสเตอร์: wide วางรูปข้างข้อความ (จอใหญ่) / ไม่ wide รูปอยู่บนข้อความ */
export function AnnouncementCard({ item, wide = false, posterMaxHeight }: { item: Announcement; wide?: boolean; posterMaxHeight?: string }) {
  const poster = Boolean(item.imageUrl);
  return (
    <article className={cn('enter h-full rounded-card bg-surface p-5 shadow-card ring-1', item.pinned ? 'ring-gold' : 'ring-line',
      poster && wide && 'md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-6')}>
      {poster && (
        <Poster url={item.imageUrl} width={item.imageWidth} height={item.imageHeight} title={item.title}
          className={wide ? 'mb-4 md:mb-0' : 'mb-4'} {...(posterMaxHeight ? { maxHeight: posterMaxHeight } : {})} />
      )}
      <div className="min-w-0">
        <h3 className="flex items-start gap-2 text-lg font-semibold [overflow-wrap:anywhere]">
          {item.pinned && <Pin className="mt-1 size-4 shrink-0 text-gold-ink" aria-label="ปักหมุด" />}{item.title}
        </h3>
        <p className="text-sm text-ink-muted"><time dateTime={item.updatedAt}>{thaiLongDate(bangkokDateParts(item.updatedAt))}</time></p>
        <p className="mt-2 whitespace-pre-line [overflow-wrap:anywhere]">{item.body}</p>
      </div>
    </article>
  );
}
