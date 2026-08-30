import { describe, it, expect } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import {
  Skeleton,
  ActivityCardSkeleton,
  StatsCardSkeleton,
  ChartSkeleton,
  ListItemSkeleton,
  CardGridSkeleton,
  LoadingWrapper,
} from "../Skeleton";

describe("Skeleton Components", () => {
  it("should render skeleton placeholders and loading wrapper", () => {
    const { container } = render(
      <>
        <Skeleton className="w-20 h-4" />
        <ActivityCardSkeleton />
        <StatsCardSkeleton />
        <ChartSkeleton />
        <ListItemSkeleton count={2} />
        <CardGridSkeleton columns={3} count={3} />
        <LoadingWrapper isLoading={true}>
          <div>Loaded</div>
        </LoadingWrapper>
      </>
    );
    expect(container.querySelectorAll(".shimmer").length).toBeGreaterThan(0);
  });
});
