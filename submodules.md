Under construction

# How to add submodule

- git submodule add https://github.com/volmexfinance/chart.git src/components/TVChart

# How to install submodules as someone that didn't add the submodule

```css
git submodule update --init --recursive
```

# If using webpack, you will need to have the following in CopyPlugin:

```
new CopyPlugin({

      patterns: [


        {

          from: 'src/tvcharts.css',

          to: 'tvcharts.css',

        },

        {

          from: 'src/components/TVChart/charting_library',

          to: 'charting_library',

        },

      ],

    })
```
# How to update stale chart
1. cd into folder of submodule.
2. switch or checkout to the commit/branch that you want
3. cd out of folder of submodule.
4. add, commit, push
