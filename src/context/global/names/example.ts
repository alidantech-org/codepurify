import type { NamesContext, CasingContext, NameVariantContext, NameArraysContext, NameUnitContext } from './type';
import type { ArrayItemContext, ArrayChildContext } from '../arrays/type';

/**
 * Example NamesContext for the input string "UserProfileSettings"
 *
 * This demonstrates all the nested structures and transformations
 * that the NamesContext provides for template rendering and code generation.
 */
export const exampleNamesContext: NamesContext = {
  // Original source name
  original: 'UserProfileSettings',

  // Character length of the original name
  length: 18,

  // All casing transformations
  casing: {
    camel: 'userProfileSettings',
    pascal: 'UserProfileSettings',
    snake: 'user_profile_settings',
    kebab: 'user-profile-settings',
    dot: 'user.profile.settings',
    slash: 'user/profile/settings',
    path: 'user/profile/settings',
    constant: 'USER_PROFILE_SETTINGS',
    lower: 'userprofilesettings',
    upper: 'USERPROFILESETTINGS',
    title: 'User Profile Settings',
    train: 'User-Profile-Settings',
  },

  // Structured arrays derived from the original name
  arrays: {
    // Parts array: ["user", "profile", "settings"]
    parts: {
      length: 3,
      items: [
        {
          index: 0,
          casing: {
            camel: 'user',
            pascal: 'User',
            snake: 'user',
            kebab: 'user',
            dot: 'user',
            slash: 'user',
            path: 'user',
            constant: 'USER',
            lower: 'user',
            upper: 'USER',
            title: 'User',
            train: 'User',
          },
        },
        {
          index: 1,
          casing: {
            camel: 'profile',
            pascal: 'Profile',
            snake: 'profile',
            kebab: 'profile',
            dot: 'profile',
            slash: 'profile',
            path: 'profile',
            constant: 'PROFILE',
            lower: 'profile',
            upper: 'PROFILE',
            title: 'Profile',
            train: 'Profile',
          },
        },
        {
          index: 2,
          casing: {
            camel: 'settings',
            pascal: 'Settings',
            snake: 'settings',
            kebab: 'settings',
            dot: 'settings',
            slash: 'settings',
            path: 'settings',
            constant: 'SETTINGS',
            lower: 'settings',
            upper: 'SETTINGS',
            title: 'Settings',
            train: 'Settings',
          },
        },
      ],
    },

    // Words array: ["user", "profile", "settings"] (same as parts for this example)
    words: {
      length: 3,
      items: [
        {
          index: 0,
          casing: {
            camel: 'user',
            pascal: 'User',
            snake: 'user',
            kebab: 'user',
            dot: 'user',
            slash: 'user',
            path: 'user',
            constant: 'USER',
            lower: 'user',
            upper: 'USER',
            title: 'User',
            train: 'User',
          },
        },
        {
          index: 1,
          casing: {
            camel: 'profile',
            pascal: 'Profile',
            snake: 'profile',
            kebab: 'profile',
            dot: 'profile',
            slash: 'profile',
            path: 'profile',
            constant: 'PROFILE',
            lower: 'profile',
            upper: 'PROFILE',
            title: 'Profile',
            train: 'Profile',
          },
        },
        {
          index: 2,
          casing: {
            camel: 'settings',
            pascal: 'Settings',
            snake: 'settings',
            kebab: 'settings',
            dot: 'settings',
            slash: 'settings',
            path: 'settings',
            constant: 'SETTINGS',
            lower: 'settings',
            upper: 'SETTINGS',
            title: 'Settings',
            train: 'Settings',
          },
        },
      ],
    },

    // Characters array: Each character as a unit
    characters: {
      length: 18,
      items: [
        {
          index: 0,
          casing: {
            camel: 'U',
            pascal: 'U',
            snake: 'u',
            kebab: 'u',
            dot: 'u',
            slash: 'u',
            path: 'u',
            constant: 'U',
            lower: 'u',
            upper: 'U',
            title: 'U',
            train: 'U',
          },
        },
        {
          index: 1,
          casing: {
            camel: 's',
            pascal: 'S',
            snake: 's',
            kebab: 's',
            dot: 's',
            slash: 's',
            path: 's',
            constant: 'S',
            lower: 's',
            upper: 'S',
            title: 'S',
            train: 'S',
          },
        },
        {
          index: 2,
          casing: {
            camel: 'e',
            pascal: 'E',
            snake: 'e',
            kebab: 'e',
            dot: 'e',
            slash: 'e',
            path: 'e',
            constant: 'E',
            lower: 'e',
            upper: 'E',
            title: 'E',
            train: 'E',
          },
        },
        {
          index: 3,
          casing: {
            camel: 'r',
            pascal: 'R',
            snake: 'r',
            kebab: 'r',
            dot: 'r',
            slash: 'r',
            path: 'r',
            constant: 'R',
            lower: 'r',
            upper: 'R',
            title: 'R',
            train: 'R',
          },
        },
        {
          index: 4,
          casing: {
            camel: 'p',
            pascal: 'P',
            snake: 'p',
            kebab: 'p',
            dot: 'p',
            slash: 'p',
            path: 'p',
            constant: 'P',
            lower: 'p',
            upper: 'P',
            title: 'P',
            train: 'P',
          },
        },
        {
          index: 5,
          casing: {
            camel: 'r',
            pascal: 'R',
            snake: 'r',
            kebab: 'r',
            dot: 'r',
            slash: 'r',
            path: 'r',
            constant: 'R',
            lower: 'r',
            upper: 'R',
            title: 'R',
            train: 'R',
          },
        },
        {
          index: 6,
          casing: {
            camel: 'o',
            pascal: 'O',
            snake: 'o',
            kebab: 'o',
            dot: 'o',
            slash: 'o',
            path: 'o',
            constant: 'O',
            lower: 'o',
            upper: 'O',
            title: 'O',
            train: 'O',
          },
        },
        {
          index: 7,
          casing: {
            camel: 'f',
            pascal: 'F',
            snake: 'f',
            kebab: 'f',
            dot: 'f',
            slash: 'f',
            path: 'f',
            constant: 'F',
            lower: 'f',
            upper: 'F',
            title: 'F',
            train: 'F',
          },
        },
        {
          index: 8,
          casing: {
            camel: 'i',
            pascal: 'I',
            snake: 'i',
            kebab: 'i',
            dot: 'i',
            slash: 'i',
            path: 'i',
            constant: 'I',
            lower: 'i',
            upper: 'I',
            title: 'I',
            train: 'I',
          },
        },
        {
          index: 9,
          casing: {
            camel: 'l',
            pascal: 'L',
            snake: 'l',
            kebab: 'l',
            dot: 'l',
            slash: 'l',
            path: 'l',
            constant: 'L',
            lower: 'l',
            upper: 'L',
            title: 'L',
            train: 'L',
          },
        },
        {
          index: 10,
          casing: {
            camel: 'e',
            pascal: 'E',
            snake: 'e',
            kebab: 'e',
            dot: 'e',
            slash: 'e',
            path: 'e',
            constant: 'E',
            lower: 'e',
            upper: 'E',
            title: 'E',
            train: 'E',
          },
        },
        {
          index: 11,
          casing: {
            camel: 's',
            pascal: 'S',
            snake: 's',
            kebab: 's',
            dot: 's',
            slash: 's',
            path: 's',
            constant: 'S',
            lower: 's',
            upper: 'S',
            title: 'S',
            train: 'S',
          },
        },
        {
          index: 12,
          casing: {
            camel: 'e',
            pascal: 'E',
            snake: 'e',
            kebab: 'e',
            dot: 'e',
            slash: 'e',
            path: 'e',
            constant: 'E',
            lower: 'e',
            upper: 'E',
            title: 'E',
            train: 'E',
          },
        },
        {
          index: 13,
          casing: {
            camel: 't',
            pascal: 'T',
            snake: 't',
            kebab: 't',
            dot: 't',
            slash: 't',
            path: 't',
            constant: 'T',
            lower: 't',
            upper: 'T',
            title: 'T',
            train: 'T',
          },
        },
        {
          index: 14,
          casing: {
            camel: 't',
            pascal: 'T',
            snake: 't',
            kebab: 't',
            dot: 't',
            slash: 't',
            path: 't',
            constant: 'T',
            lower: 't',
            upper: 'T',
            title: 'T',
            train: 'T',
          },
        },
        {
          index: 15,
          casing: {
            camel: 'i',
            pascal: 'I',
            snake: 'i',
            kebab: 'i',
            dot: 'i',
            slash: 'i',
            path: 'i',
            constant: 'I',
            lower: 'i',
            upper: 'I',
            title: 'I',
            train: 'I',
          },
        },
        {
          index: 16,
          casing: {
            camel: 'n',
            pascal: 'N',
            snake: 'n',
            kebab: 'n',
            dot: 'n',
            slash: 'n',
            path: 'n',
            constant: 'N',
            lower: 'n',
            upper: 'N',
            title: 'N',
            train: 'N',
          },
        },
        {
          index: 17,
          casing: {
            camel: 'g',
            pascal: 'G',
            snake: 'g',
            kebab: 'g',
            dot: 'g',
            slash: 'g',
            path: 'g',
            constant: 'G',
            lower: 'g',
            upper: 'G',
            title: 'G',
            train: 'G',
          },
        },
      ],
    },
  },

  // Singular derived name context (same as original for this example)
  singular: {
    casing: {
      camel: 'userProfileSetting',
      pascal: 'UserProfileSetting',
      snake: 'user_profile_setting',
      kebab: 'user-profile-setting',
      dot: 'user.profile.setting',
      slash: 'user/profile/setting',
      path: 'user/profile/setting',
      constant: 'USER_PROFILE_SETTING',
      lower: 'userprofilesetting',
      upper: 'USERPROFILESETTING',
      title: 'User Profile Setting',
      train: 'User-Profile-Setting',
    },
    arrays: {
      parts: {
        length: 3,
        items: [
          {
            index: 0,
            casing: {
              camel: 'user',
              pascal: 'User',
              snake: 'user',
              kebab: 'user',
              dot: 'user',
              slash: 'user',
              path: 'user',
              constant: 'USER',
              lower: 'user',
              upper: 'USER',
              title: 'User',
              train: 'User',
            },
          },
          {
            index: 1,
            casing: {
              camel: 'profile',
              pascal: 'Profile',
              snake: 'profile',
              kebab: 'profile',
              dot: 'profile',
              slash: 'profile',
              path: 'profile',
              constant: 'PROFILE',
              lower: 'profile',
              upper: 'PROFILE',
              title: 'Profile',
              train: 'Profile',
            },
          },
          {
            index: 2,
            casing: {
              camel: 'setting',
              pascal: 'Setting',
              snake: 'setting',
              kebab: 'setting',
              dot: 'setting',
              slash: 'setting',
              path: 'setting',
              constant: 'SETTING',
              lower: 'setting',
              upper: 'SETTING',
              title: 'Setting',
              train: 'Setting',
            },
          },
        ],
      },
      words: {
        length: 3,
        items: [
          {
            index: 0,
            casing: {
              camel: 'user',
              pascal: 'User',
              snake: 'user',
              kebab: 'user',
              dot: 'user',
              slash: 'user',
              path: 'user',
              constant: 'USER',
              lower: 'user',
              upper: 'USER',
              title: 'User',
              train: 'User',
            },
          },
          {
            index: 1,
            casing: {
              camel: 'profile',
              pascal: 'Profile',
              snake: 'profile',
              kebab: 'profile',
              dot: 'profile',
              slash: 'profile',
              path: 'profile',
              constant: 'PROFILE',
              lower: 'profile',
              upper: 'PROFILE',
              title: 'Profile',
              train: 'Profile',
            },
          },
          {
            index: 2,
            casing: {
              camel: 'setting',
              pascal: 'Setting',
              snake: 'setting',
              kebab: 'setting',
              dot: 'setting',
              slash: 'setting',
              path: 'setting',
              constant: 'SETTING',
              lower: 'setting',
              upper: 'SETTING',
              title: 'Setting',
              train: 'Setting',
            },
          },
        ],
      },
      characters: {
        length: 17,
        items: [
          {
            index: 0,
            casing: {
              camel: 'u',
              pascal: 'U',
              snake: 'u',
              kebab: 'u',
              dot: 'u',
              slash: 'u',
              path: 'u',
              constant: 'U',
              lower: 'u',
              upper: 'U',
              title: 'U',
              train: 'U',
            },
          },
          {
            index: 1,
            casing: {
              camel: 's',
              pascal: 'S',
              snake: 's',
              kebab: 's',
              dot: 's',
              slash: 's',
              path: 's',
              constant: 'S',
              lower: 's',
              upper: 'S',
              title: 'S',
              train: 'S',
            },
          },
          // ... remaining characters omitted for brevity
        ],
      },
    },
  },

  // Plural derived name context (same as original for this example)
  plural: {
    casing: {
      camel: 'userProfileSettings',
      pascal: 'UserProfileSettings',
      snake: 'user_profile_settings',
      kebab: 'user-profile-settings',
      dot: 'user.profile.settings',
      slash: 'user/profile/settings',
      path: 'user/profile/settings',
      constant: 'USER_PROFILE_SETTINGS',
      lower: 'userprofilesettings',
      upper: 'USERPROFILESETTINGS',
      title: 'User Profile Settings',
      train: 'User-Profile-Settings',
    },
    arrays: {
      parts: {
        length: 3,
        items: [
          {
            index: 0,
            casing: {
              camel: 'user',
              pascal: 'User',
              snake: 'user',
              kebab: 'user',
              dot: 'user',
              slash: 'user',
              path: 'user',
              constant: 'USER',
              lower: 'user',
              upper: 'USER',
              title: 'User',
              train: 'User',
            },
          },
          {
            index: 1,
            casing: {
              camel: 'profile',
              pascal: 'Profile',
              snake: 'profile',
              kebab: 'profile',
              dot: 'profile',
              slash: 'profile',
              path: 'profile',
              constant: 'PROFILE',
              lower: 'profile',
              upper: 'PROFILE',
              title: 'Profile',
              train: 'Profile',
            },
          },
          {
            index: 2,
            casing: {
              camel: 'settings',
              pascal: 'Settings',
              snake: 'settings',
              kebab: 'settings',
              dot: 'settings',
              slash: 'settings',
              path: 'settings',
              constant: 'SETTINGS',
              lower: 'settings',
              upper: 'SETTINGS',
              title: 'Settings',
              train: 'Settings',
            },
          },
        ],
      },
      words: {
        length: 3,
        items: [
          {
            index: 0,
            casing: {
              camel: 'user',
              pascal: 'User',
              snake: 'user',
              kebab: 'user',
              dot: 'user',
              slash: 'user',
              path: 'user',
              constant: 'USER',
              lower: 'user',
              upper: 'USER',
              title: 'User',
              train: 'User',
            },
          },
          {
            index: 1,
            casing: {
              camel: 'profile',
              pascal: 'Profile',
              snake: 'profile',
              kebab: 'profile',
              dot: 'profile',
              slash: 'profile',
              path: 'profile',
              constant: 'PROFILE',
              lower: 'profile',
              upper: 'PROFILE',
              title: 'Profile',
              train: 'Profile',
            },
          },
          {
            index: 2,
            casing: {
              camel: 'settings',
              pascal: 'Settings',
              snake: 'settings',
              kebab: 'settings',
              dot: 'settings',
              slash: 'settings',
              path: 'settings',
              constant: 'SETTINGS',
              lower: 'settings',
              upper: 'SETTINGS',
              title: 'Settings',
              train: 'Settings',
            },
          },
        ],
      },
      characters: {
        length: 18,
        items: [
          {
            index: 0,
            casing: {
              camel: 'u',
              pascal: 'U',
              snake: 'u',
              kebab: 'u',
              dot: 'u',
              slash: 'u',
              path: 'u',
              constant: 'U',
              lower: 'u',
              upper: 'U',
              title: 'U',
              train: 'U',
            },
          },
          {
            index: 1,
            casing: {
              camel: 's',
              pascal: 'S',
              snake: 's',
              kebab: 's',
              dot: 's',
              slash: 's',
              path: 's',
              constant: 'S',
              lower: 's',
              upper: 'S',
              title: 'S',
              train: 'S',
            },
          },
          // ... remaining characters omitted for brevity
        ],
      },
    },
  },
};

/**
 * Example usage in templates showing how to access different parts of the NamesContext
 */
export const templateUsageExamples = {
  // Basic casing transformations
  basicUsage: {
    camelCase: '{{names.casing.camel}}', // userProfileSettings
    pascalCase: '{{names.casing.pascal}}', // UserProfileSettings
    snakeCase: '{{names.casing.snake}}', // user_profile_settings
    constantCase: '{{names.casing.constant}}', // USER_PROFILE_SETTINGS
  },

  // Array iterations
  arrayIterations: {
    partsIteration: `
{{#each names.arrays.parts.items}}
  {{index}}: {{casing.pascal}}
{{/each}}`,
    // Output:
    // 0: User
    // 1: Profile
    // 2: Settings

    charactersIteration: `
{{#each names.arrays.characters.items}}
  {{index}}: {{casing.upper}}
{{/each}}`,
    // Output:
    // 0: U
    // 1: S
    // 2: E
    // ... etc
  },

  // Singular vs Plural
  singularPlural: {
    singular: '{{names.singular.casing.pascal}}', // UserProfileSetting
    plural: '{{names.plural.casing.pascal}}', // UserProfileSettings
  },

  // Complex nested access
  nestedAccess: {
    firstPart: '{{names.arrays.parts.items.0.casing.pascal}}', // User
    lastPart: '{{names.arrays.parts.items.2.casing.snake}}', // settings
    originalLength: '{{names.length}}', // 18
  },
};
