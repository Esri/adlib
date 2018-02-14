# TODO

This project is getting more and more features, and the code is getting more complex. This list tracks ideas to streamline it more.

- extract the act of "getting a value from the settings" process from the "apply transforms" step, allowing transforms to be run on default values (i.e. translating a static string)

- tokenize the contents of the property we are working with
  `"Welcome {{currentUser.name:upcase||User}} last login {{currentUser.lastLogin:toISO||never}}"`
  - becomes:
  ```
  [
    {
      template: "{{currentUser.name:upcase||User}}",
      parts: [
        {
          key: 'currentUser.name',
          transform: upcase
        },
        {
          key: 'User',
          transform: null
        }
      ]
    },
    template: "{{currentUser.lastLogin:toISO||never}}",
    parts: [
      {
        key: "currentUser.lastLogin",
        transform: toISO
      },
      {
        key: "never",
        transform: null
      }
    ]
  ]
  ```
  which we then process and add more to each entry as the process proceeds...
  ```
  ...
  parts: [
    {
      key: 'currentUser.name',
      transform: upcase,
      value: null
    },
    {
      key: 'User',
      transform: null,
      value: 'User'
    }
  ]
  ...
  ```
  Which we can then use `Array.find((e) return !!e.value)` to get the value out...

- in general, break this apart into many smaller pure functions

- see if we can make this return a new object graph vs mutating the passed in object
