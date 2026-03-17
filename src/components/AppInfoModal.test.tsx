import { Linking } from "react-native";
import { fireEvent, screen } from "@testing-library/react-native";

import renderWithTheme from "@/test/renderWithTheme";

import AppInfoModal from "./AppInfoModal";

describe("AppInfoModal", () => {
  it("renders app name, version, and support links when visible", () => {
    renderWithTheme(<AppInfoModal visible={true} onClose={jest.fn()} />);

    expect(screen.getByText("About")).toBeTruthy();
    expect(screen.getByText("in due time")).toBeTruthy();
    expect(screen.getByText(/Version/)).toBeTruthy();
    expect(screen.queryByText(/Build:/)).toBeNull();
    expect(screen.getByText("Development Build")).toBeTruthy();
    expect(screen.getByText(/Android|iOS/)).toBeTruthy();

    // Support links are present
    expect(screen.getByLabelText("Help and FAQ")).toBeTruthy();
    expect(screen.getByLabelText("Report a Bug")).toBeTruthy();
    expect(screen.getByLabelText("Request a Feature")).toBeTruthy();
  });

  it("calls onClose when Close button is pressed", () => {
    const onClose = jest.fn();
    renderWithTheme(<AppInfoModal visible={true} onClose={onClose} />);

    fireEvent.press(screen.getByText("Close"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not render content when visible=false", () => {
    renderWithTheme(<AppInfoModal visible={false} onClose={jest.fn()} />);

    expect(screen.queryByText("About")).toBeNull();
  });

  it("opens bug report form with pre-filled version on press", () => {
    const spy = jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);
    renderWithTheme(<AppInfoModal visible={true} onClose={jest.fn()} />);

    fireEvent.press(screen.getByLabelText("Report a Bug"));

    const url = spy.mock.calls[0][0] as string;
    expect(url).toContain("docs.google.com/forms");
    expect(url).toContain("entry.1845428880=");
    expect(url).toContain("entry.765646897=");
    spy.mockRestore();
  });

  it("opens feature request form on press", () => {
    const spy = jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);
    renderWithTheme(<AppInfoModal visible={true} onClose={jest.fn()} />);

    fireEvent.press(screen.getByLabelText("Request a Feature"));

    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("docs.google.com/forms"),
    );
    spy.mockRestore();
  });
});
