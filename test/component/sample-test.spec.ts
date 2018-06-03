
import test, {App, check, click, expectThat, http, keydown, Server, submit, type} from "../../dist/index";

import {AppComponent} from "./app.component";
import {AppModule} from "./app.module";

describe("Manager Component", () => {

    let app: App;
    let server: Server;

    beforeEach(() => {
        app = test(AppModule);
        server = http();
    });

    it("initial value", () => {
        const comp = app.run(AppComponent);

        comp.verify(
            expectThat.textOf(".title").isEqualTo("Fancy title!")
        );
    });

    it("greets person after button clicked", () => {
        const comp = app.run(AppComponent);

        comp.perform(
            type("Jane").in("input.name"),
            click.in("button#hello")
        );

        comp.verify(
            expectThat.textOf(".greeting").isEqualTo("Hello Jane!")
        );
    });

    it("greets person after enter pressed", () => {
        const comp = app.run(AppComponent);

        comp.perform(
            type("John").in("input.name"),
            keydown("Enter").in("input.name")
        );

        comp.verify(
            expectThat.textOf(".greeting").isEqualTo("Hello John!")
        );
    });

    it("goodbye server response", () => {
        const comp = app.run(AppComponent);
        server.post("/goodbye", (req) => req.sendJson({message: "Goodbye Jane!"}));

        comp.perform(
            click.in("button.goodbye")
        );

        comp.verify(
            expectThat.textOf(".greeting").isEqualTo("Goodbye Jane!")
        );
    });

    it("has editable content", () => {
        const comp = app.run(AppComponent);

        comp.perform(
            type("new content").in("#editor")
        );

        comp.verify(
            expectThat.textOf("#editor").isEqualTo("new content")
        );
    });

    it("initially checkbox is not checked", () => {
        const comp = app.run(AppComponent);

        comp.verify(
            expectThat.valueOf("#checkbox").isEqualTo(false)
        );
    });

    it("check checkbox", () => {
        const comp = app.run(AppComponent);

        comp.perform(
            check.in("#checkbox")
        );

        comp.verify(
            expectThat.valueOf("#checkbox").isEqualTo(true)
        );
    });

    it("allows to verify with plural syntax", () => {
        const comp = app.run(AppComponent);

        comp.verify(
            expectThat.textsOf("div").areEqualTo(["nothing yet", "This needs to be edited!"]),
            expectThat.cssClassesOf("div").contain("greeting"),
            expectThat.valuesOf("input").areEqualTo(["", false]),
            expectThat.elements("h1").haveSize(1),
            expectThat.attributesOf("button", "id").areEqualTo(["hello", "goodbye"]),
            expectThat.attributesOf("button", "missing").isEmpty()
        );
    });

    it("check if element exists and doesNotExist", () => {
        const comp = app.run(AppComponent);

        comp.verify(
            expectThat.element("h1").exists(),
            expectThat.element("h2").doesNotExist()
        );
    });

    it("submit form to update status", () => {
        const comp = app.run(AppComponent);
        server.put("/update", (req) => req.sendJson({message: "Updated!"}));

        comp.perform(
            submit.form("form")
        );

        comp.verify(
            expectThat.textOf("#status").isEqualTo("Updated!")
        );
    });

    it("check attribute value of an element", () => {

      const comp = app.run(AppComponent);

      comp.verify(
          expectThat.attributeOf("#editor", "contenteditable").isEqualTo("true"),
          expectThat.attributeOf("#editor", "missing").doesNotExist()
      );
    });

    it("check text & attributes of svg elements", () => {

      const comp = app.run(AppComponent);

      comp.verify(
          expectThat.attributeOf("rect.box", "x").isEqualTo("10"),
          expectThat.textOf("text.label").isEqualTo("Text in SVG"),
          expectThat.attributesOf("rect", "class").areEqualTo(["box", "rectangle"])
      );
    });

    it('should emit event for standard output name', () => {
        let received;
        const comp = app.run(AppComponent, {}, {emitted: (v: string) => received = v});

        comp.perform(
            click.in('#clickable')
        );

        comp.verify(
            () => expect(received).toEqual('supports simple name')
        );
    });

    it('should emit event for banana name [( )] - aka ngModel style', () => {
        let received;
        const comp = app.run(AppComponent, {}, {bananaStyle: (v: string) => received = v});

        comp.perform(
            click.in('#clickable')
        );

        comp.verify(
            () => expect(received).toEqual('supports banana syntax')
        );
    });

});
