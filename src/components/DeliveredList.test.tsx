import { render, screen } from "@testing-library/react-native";

import { Entry } from "@/storage";
import renderWithTheme from "@/test/renderWithTheme";
import { Layout, ThemeProvider } from "@/theme";

import DeliveredList from "./DeliveredList";

const DELIVERED_ENTRY: Entry = {
  id: "d1",
  name: "Jane Doe",
  dueDate: "2025-06-15",
  createdAt: 1700000000000,
  deliveredAt: 1700100000000,
  birthstone: { name: "pearl", color: "#F0EDE8" },
};

const defaultListProps = {
  onDelete: jest.fn(),
  onDeleteAll: jest.fn(),
  deliveredTTLDays: 3,
  onChangeDeliveredTTL: jest.fn(),
};

function renderWithLayout(
  layout: Layout,
  entries: Entry[] = [DELIVERED_ENTRY],
) {
  return renderWithTheme(
    <DeliveredList entries={entries} {...defaultListProps} />,
    { layout },
  );
}

/** For rerender tests that need to change layout, we need a wrapper approach. */
function renderForLayoutSwitch(
  initialLayout: Layout,
  entries: Entry[] = [DELIVERED_ENTRY],
) {
  let currentLayout = initialLayout;

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider
      personality="classic"
      brightness="light"
      layout={currentLayout}
      setPersonality={jest.fn()}
      setBrightness={jest.fn()}
      setLayout={jest.fn()}
    >
      {children}
    </ThemeProvider>
  );

  const result = render(
    <DeliveredList entries={entries} {...defaultListProps} />,
    { wrapper: Wrapper },
  );

  return {
    ...result,
    switchLayout: (newLayout: Layout) => {
      currentLayout = newLayout;
      result.rerender(
        <DeliveredList entries={entries} {...defaultListProps} />,
      );
    },
  };
}

describe("DeliveredList", () => {
  it("renders in compact layout without crashing", () => {
    renderWithLayout("compact");
    expect(screen.getByText("Jane Doe")).toBeTruthy();
  });

  it("renders in cozy layout without crashing", () => {
    renderWithLayout("cozy");
    expect(screen.getByText("Jane Doe")).toBeTruthy();
  });

  it("switches from cozy to compact without crashing (regression: FlatList numColumns)", () => {
    const { switchLayout } = renderForLayoutSwitch("cozy");
    switchLayout("compact");
    expect(screen.getByText("Jane Doe")).toBeTruthy();
  });

  it("switches from compact to cozy without crashing", () => {
    const { switchLayout } = renderForLayoutSwitch("compact");
    switchLayout("cozy");
    expect(screen.getByText("Jane Doe")).toBeTruthy();
  });

  it("shows empty state when no delivered entries", () => {
    renderWithLayout("compact", []);
    expect(screen.getByText("No deliveries yet")).toBeTruthy();
  });

  it("shows empty state in cozy mode when no delivered entries", () => {
    renderWithLayout("cozy", []);
    expect(screen.getByText("No deliveries yet")).toBeTruthy();
  });

  it("shows header with delivered count", () => {
    renderWithLayout("compact");
    expect(screen.getByText("Delivered")).toBeTruthy();
    expect(screen.getByText("1")).toBeTruthy();
  });

  it("filters to only delivered entries", () => {
    const entries: Entry[] = [
      DELIVERED_ENTRY,
      {
        id: "a1",
        name: "Active Patient",
        dueDate: "2025-07-01",
        createdAt: 1700000000000,
      },
    ];
    renderWithLayout("compact", entries);
    expect(screen.getByText("Jane Doe")).toBeTruthy();
    expect(screen.queryByText("Active Patient")).toBeNull();
  });
});
