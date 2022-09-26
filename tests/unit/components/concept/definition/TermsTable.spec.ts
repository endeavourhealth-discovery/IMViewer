import { beforeEach, describe, expect, it, vi } from "vitest";
import {render, RenderResult, within} from '@testing-library/vue';

import TermsTable from "@/components/concept/definition/TermsTable.vue";
import Button from "primevue/button";
import StyleClass from "primevue/styleclass";
import DataTable from "primevue/datatable";
import Column from "primevue/column";

import testData from "./TermsTable.testData.json"

describe("TermsTable.vue - populated", () => {
    // Spies

    let component: RenderResult;

    beforeEach(() => {
        component = render(TermsTable, {
            global: {
                components: { Button, StyleClass, DataTable, Column },
                directives: { styleclass: StyleClass }
            },
            props: {
                label: "Terms",
                    size: "100%",
                    id: "TermsTable17",
                    data: testData
            }
        })
    });

    it("Is displayed",  () => {
        component.getByTestId("container");
    });

    it("Contains data", () => {
        const dataTable = component.getByTestId("data-table");
        expect(dataTable, "Datatable present").toBeTruthy();

        const names = within(dataTable).getAllByTestId("col-name");
        expect(names.length, "Name count").toBe(3);
        expect(names[0].textContent, "First name").toBe("Scoliosis deformity of spine");

        const codes = within(dataTable).getAllByTestId("col-code");
        expect(codes.length, "Code count").toBe(3);
        expect(codes[1].textContent, "No code").toBe("None");
        expect(codes[2].textContent, "Last code").toBe("2153143014");
    });
});

describe("TermsTable.vue - empty", () => {
    // Spies

    let component: RenderResult;

    beforeEach(() => {
        component = render(TermsTable, {
            global: {
                components: { Button, StyleClass, DataTable, Column },
                directives: { styleclass: StyleClass }
            },
            props: {
                label: "Terms",
                size: "100%",
                id: "TermsTable17",
                data: []
            }
        })
    });

    it("Is not displayed", () => {
        expect(component.queryByTestId("container"), "Datatable present").toBeFalsy();
    });
});
