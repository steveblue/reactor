const template = {
'fn-component': `
import React from "react";

export default function {{name}}() {
    return (
        <h1>{{name}} works!</h1>
    );
}

`,
'arrow-fn-component': `
import React from "react";

export default const {{name}} = () => <h1>{{name}} works!</h1>;

`,
'component': `
import React from "react";

export default class {{name}} extends React.Component {
    public render(): JSX.Element {
        return (
            <h1>{{name}} works!</h1>
        );
    }
}

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

import {{name}} from "./{{name}}";

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

`,
'route': `
    <Route exact={true} path="/{{routeName}}" component={{{name}}} />
`,
'lazy-route': `
    <Route exact={true} path="/{{routeName}}" render={() => <{{name}} />} />
`,
'imported-component': `
const {{name}} = importComponent(() => import("./{{path}}/{{name}}"));
`
}

module.exports = template;