# react-native-cascade

[![Travis Status](https://travis-ci.org/kcjonson/react-native-cascade.svg?branch=master)]()


react-native cascade is a Babel plugin that will pair css declarations in imported stylesheets with nodes matching their selectors in JSX, automatically.

## Goals
- Reduce boilerplate and unnecessary dev effort caused by manually pairing React Native stylesheets with JSX nodes
- Feels like writing styles on web as much as possible and uses web style cascade priorities
-  Automatically pairs any css selectors from an imported stylesheet to nodes in a JSX template without any manual steps
- Does not create global scope, all styles remain tightly bound to the component importing them
- Usable with any utility that would create classname strings such as classnames


## Installation

```Shell
npm install babel-preset-react-native-cascade --save-dev
```

add it to the plugins list in your `.babelrc`

```JSON
{
  "presets": ["env", "react-native"],
  "plugins": ["babel-preset-react-native-cascade"]
}
```

## What it does

**Example.jsx**
```Javascript
import React, { Component } from 'react';
import { Text } from 'react-native';

import './Example.css';

export default class Example extends Component {
  render() {
    return <Text className="text-large container">Hello</Text>;
  }
}
```

**Example.css**
```Javascript
module.exports = [
  ['container', [
    ['color', 'green']
  ]],
  ['text-large', [
    ['fontSize', 24],
    ['color', 'red']
  ]]
]
```

after the transform the file will look like this(ish)

```Javascript
import React, { Component } from 'react';
import { Text } from 'react-native';

import _stylesheet from './styles.css';
const _stylesheets = [_stylesheet];

export default class Example extends Component {
  render() {
    return <Text className="text-large container"
        styles={computeStyle("text-large container", _stylesheets)}>Hello</Text>
  }
}


function computeStyle(classNames, stylesheets) {...}
```


## Selectors

Right now only the class selector is supported `.component {}` and no nesting

## Roadmap

- Write more tests, Find bugs, Fix bugs
- Handle named stylesheet imports
- Support node type selectors `View {}`;
- Support child selectors `View .container {}`
- Release webpack plugin that javascriptifies stylesheets, possibly gulp build step as well
- [maybe] Implement property inheritance within a single component scope (style won't inherit from one component to another, but will within a component)

## Footnote - What does "cascade" mean anyway?

The word "cascade" gets thrown around a lot when talking about css. Theres an obvious reason for that since you cant say css without it! However, its also misused quite frequently. Acutually, Facebooks own document on how the style property works in React Native has one of those misuses at https://facebook.github.io/react-native/docs/style.html

> One common pattern is to make your component accept a style prop which in turn is used to style subcomponents. You can use this to make styles "cascade" the way they do in CSS.

They at least were kind enough to put it in quotes, but thats not really what cascade means (although it certainly sounds reasonable). What that document is talking about is actually style inheritance, which is also useful ... *and broken in React Native as well*, but not not the real cascade.

Mozilla has a much better description at https://developer.mozilla.org/en-US/docs/Web/CSS/Cascade

> The cascade is an algorithm that defines how to combine property values originating from different sources. It lies at the core of CSS, as emphasized by the name: Cascading Style Sheets.

The key there is the bit about **"defines how to combine property values"** which is what this project attempts to recreate for React Native. The Mozilla definition briefly touches on cascading order but doesn't dive into what happens when there are duplicate selectors of equal [specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity) in a single source or how ordering of declarations of a single source. There is actually quite a bit that goes on and a lengthier article on MDN titled [Cascade and inheritance](https://developer.mozilla.org/en-US/docs/Learn/CSS/Introduction_to_CSS/Cascade_and_inheritance) goes into the details.
