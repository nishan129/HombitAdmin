import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export function TablePagination() {
  return (
    <div className="flex flex-col w-full mt-2 items-center">
      <div className="flex flex-col md:flex-row justify-between w-full mb-2">
        <p className="text-sm font-medium">Show 1-10 of 100</p>
        <div className="flex flex-wrap justify-end space-x-1 mt-2 md:mt-0">
          <a
            href="#"
            className="px-3 py-1 text-sm text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Previous
          </a>
          <a
            href="#"
            className="px-3 py-1 text-sm text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            1
          </a>
          <a
            href="#"
            className="px-3 py-1 text-sm text-blue-600 bg-blue-200 rounded-md hover:bg-blue-300"
          >
            2
          </a>
          <a
            href="#"
            className="px-3 py-1 text-sm text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            3
          </a>
          <span className="px-3 py-1 text-sm text-gray-700">...</span>
          <a
            href="#"
            className="px-3 py-1 text-sm text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            10
          </a>
          <a
            href="#"
            className="px-3 py-1 text-sm text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Next
          </a>
        </div>
      </div>
    </div>
  );
}
