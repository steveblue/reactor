const template = {
'fn-component': `
import React from "react";

function {{name}}() {
    return (
        <h1>{{name}} works!</h1>
    );
}

export { {{name}} }
`,
'arrow-fn-component': `
import React from "react";

const {{name}} = () => <h1>{{name}} works!</h1>;

export { {{name}} }
`,
'component': `
import React from "react";

class {{name}} extends React.Component {
    public render(): JSX.Element {
        return (
            <h1>{{name}} works!</h1>
        );
    }
}

export { {{name}} }
`,
    'view': `
import React from "react";

import "./{{styleName}}.scss";

export default class {{name}} extends React.Component {
    public render(): JSX.Element {
        return (
            <div>
                <h1>{{name}} works!</h1>
            </div>
        );
    }
}
`,
'ssr': `
import React from "react";
import Helmet from "react-helmet";

import "./{{styleName}}.scss";

export default class {{name}} extends React.Component {
    public render(): JSX.Element {
        return (
            <div>
                <Helmet>
                    <title>{{name}}</title>
                </Helmet>
                <h1>{{name}} works!</h1>
            </div>
        );
    }
}
`,
'enzyme-test': `
import React from "react";
import { shallow } from "enzyme";

import { {{name}} } from "./{{name}}";

describe("{{name}} tests", () => {
    it("renders", () => {
        const wrapper = shallow(<{{name}} />);
        expect(wrapper).toBeDefined();
    });
});
`,
'state': `
const {{name}}State = {

};

function reducer(state, action) {
    switch (action.type) {
    default:
        return state;
    }
}

export { {{name}}State, reducer }
`
}

module.exports = template;