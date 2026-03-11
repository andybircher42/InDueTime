import { fireEvent, screen } from "@testing-library/react-native";

import renderWithTheme from "@/test/renderWithTheme";

import HipaaAgreementModal from "./HipaaAgreementModal";

describe("HipaaAgreementModal", () => {
  it("renders title and disclaimer text when visible", () => {
    renderWithTheme(
      <HipaaAgreementModal visible={true} onAccept={jest.fn()} />,
    );

    expect(screen.getByText("Before You Start")).toBeTruthy();
    expect(screen.getByText(/not HIPAA compliant/)).toBeTruthy();
    expect(screen.getByText("I Understand")).toBeTruthy();
  });

  it('calls onAccept when "I Understand" pressed', () => {
    const onAccept = jest.fn();
    renderWithTheme(<HipaaAgreementModal visible={true} onAccept={onAccept} />);

    fireEvent.press(screen.getByText("I Understand"));
    expect(onAccept).toHaveBeenCalledTimes(1);
  });

  it('"I Understand" button has accessible role and label', () => {
    renderWithTheme(
      <HipaaAgreementModal visible={true} onAccept={jest.fn()} />,
    );

    expect(
      screen.getByRole("button", { name: "I understand, continue to app" }),
    ).toBeTruthy();
  });

  it("does not render content when visible=false", () => {
    renderWithTheme(
      <HipaaAgreementModal visible={false} onAccept={jest.fn()} />,
    );

    expect(screen.queryByText("Before You Start")).toBeNull();
  });
});
