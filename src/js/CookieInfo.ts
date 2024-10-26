import Widget from "./Widget";
import $ from "jquery";

class CookieInfo extends Widget {
  constructor(id: string) {
    super(id);
    this.init();
  }

  private init(): void {
    const infoContainer = $("<div>", {
      class: "cookie-info",
      click: () => {
        $("#cookie-info").remove();
      },
    });

    const infoWrapper = $('<span class="info-wrapper"></span>');
    infoWrapper.append(
      '<span class="text">This site uses cookies to enable saving color themes in your browser. By continuing to browse the site, you are agreeing to our use of cookies.</span>'
    );
    infoWrapper.append("<br>");
    infoWrapper.append('<span class="confirm">OK</span>');

    infoContainer.append(infoWrapper);
    if (this.elem) this.elem.append(infoContainer);
  }
}

export default CookieInfo;
