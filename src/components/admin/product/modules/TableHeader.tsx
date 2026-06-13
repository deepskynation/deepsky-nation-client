import { tableHeadClassName } from "@/lib/panel-styles";
import { cn } from "@/lib/utils";

export type TableHeaderProps = {
  className?: string;
};

export default function TableHeader({ className }: TableHeaderProps) {
  return (
    <thead className={cn(tableHeadClassName, className)}>
      <tr>
        <th scope="col" className="w-20 px-4 py-3.5 font-semibold">
          Image
        </th>
        <th scope="col" className="px-4 py-3.5 font-semibold">
          Product
        </th>
        <th scope="col" className="hidden px-4 py-3.5 font-semibold md:table-cell">
          Category
        </th>
        <th scope="col" className="px-4 py-3.5 text-right font-semibold">
          Price
        </th>
        <th scope="col" className="px-4 py-3.5 text-right font-semibold">
          Stock
        </th>
        <th scope="col" className="px-4 py-3.5 font-semibold">
          Status
        </th>
        <th scope="col" className="hidden px-4 py-3.5 font-semibold lg:table-cell">
          Date Added
        </th>
        <th scope="col" className="px-4 py-3.5 font-semibold">
          Code
        </th>
        <th scope="col" className="w-12 px-2 py-3.5 text-right font-semibold">
          <span className="sr-only">Actions</span>
        </th>
      </tr>
    </thead>
  );
}
