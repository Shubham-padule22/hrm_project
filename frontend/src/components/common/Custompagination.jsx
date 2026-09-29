
import { Box, Typography, Stack, IconButton, Button } from "@mui/material";
import { motion } from "framer-motion";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";

const MotionIconButton = motion(IconButton);
const MotionButton = motion(Button);

/**
 * Builds the visible page-number sequence with ellipsis, e.g.
 * [1, "...", 4, 5, 6, "...", 12]
 */
function getPageSequence(currentPage, totalPages, siblingCount = 1) {
  const totalNumbers = siblingCount * 2 + 5; // first + last + current + 2*sibling + 2*ellipsis-slot

  if (totalPages <= totalNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(currentPage - siblingCount, 1);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages);

  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 1;

  const pages = [1];

  if (showLeftEllipsis) pages.push("ellipsis-left");
  for (let i = leftSibling; i <= rightSibling; i++) {
    if (i !== 1 && i !== totalPages) pages.push(i);
  }
  if (showRightEllipsis) pages.push("ellipsis-right");

  pages.push(totalPages);

  return pages;
}

/**
 * CustomPagination — reusable, controlled pagination component.
 *
 * Usage:
 * <CustomPagination
 *   page={page}
 *   totalItems={totalItems}
 *   itemsPerPage={itemsPerPage}
 *   onPageChange={(nextPage) => setPage(nextPage)}
 * />
 */
export default function CustomPagination({
  page,
  totalItems,
  itemsPerPage,
  onPageChange,
  siblingCount = 1,
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const currentPage = Math.min(Math.max(page, 1), totalPages);

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const pageSequence = getPageSequence(currentPage, totalPages, siblingCount);

  const goTo = (target) => {
    if (target < 1 || target > totalPages || target === currentPage) return;
    onPageChange(target);
  };

  const squareSx = {
    minWidth: 26,
    width: 26,
    height: 26,
    p: 0,
    borderRadius: 1.5,
    fontSize: "0.7rem",
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 1.5,
        mt: 2,
        pt: 1.5,
        px:2,
        pb:2,
        borderTop: "1px solid #F1F5F9",
      }}
    >
      <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.7rem" }}>
        Showing{" "}
        <Box component="span" fontWeight="700" color="#0F172A">
          {startItem}
        </Box>{" "}
        to{" "}
        <Box component="span" fontWeight="700" color="#0F172A">
          {endItem}
        </Box>{" "}
        of{" "}
        <Box component="span" fontWeight="700" color="#0F172A">
          {totalItems}
        </Box>{" "}
        results
      </Typography>

      <Stack direction="row" spacing={1} alignItems="center">
        <MotionIconButton
          whileHover={currentPage > 1 ? { scale: 1.1 } : {}}
          whileTap={currentPage > 1 ? { scale: 0.9 } : {}}
          size="small"
          disabled={currentPage === 1}
          onClick={() => goTo(currentPage - 1)}
          sx={{
            border: "1px solid #E2E8F0",
            borderRadius: 1.5,
            width: 26,
            height: 26,
            "&.Mui-disabled": { borderColor: "#F1F5F9" },
          }}
        >
          <ChevronLeftIcon fontSize="small" />
        </MotionIconButton>

        {pageSequence.map((entry) =>
          typeof entry === "number" ? (
            <MotionButton
              key={entry}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
              variant={entry === currentPage ? "contained" : "outlined"}
              onClick={() => goTo(entry)}
              sx={{
                ...squareSx,
                bgcolor: entry === currentPage ? "#064E3B" : "transparent",
                color: entry === currentPage ? "#fff" : "#0F172A",
                borderColor: "#E2E8F0",
                "&:hover": {
                  bgcolor: entry === currentPage ? "#064E3B" : "#F8FAFC",
                },
              }}
            >
              {entry}
            </MotionButton>
          ) : (
            <Typography
              key={entry}
              sx={{
                width: 26,
                textAlign: "center",
                color: "#94A3B8",
                fontSize: "0.75rem",
              }}
            >
              …
            </Typography>
          ),
        )}

        <MotionIconButton
          whileHover={currentPage < totalPages ? { scale: 1.1 } : {}}
          whileTap={currentPage < totalPages ? { scale: 0.9 } : {}}
          size="small"
          disabled={currentPage === totalPages}
          onClick={() => goTo(currentPage + 1)}
          sx={{
            border: "1px solid #E2E8F0",
            borderRadius: 1.5,
            width: 26,
            height: 26,
            "&.Mui-disabled": { borderColor: "#F1F5F9" },
          }}
        >
          <ChevronRightIcon fontSize="small" />
        </MotionIconButton>
      </Stack>
    </Box>
  );
}
