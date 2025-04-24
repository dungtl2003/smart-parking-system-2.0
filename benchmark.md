## Definitions

- signal to light (ms): The time it takes from receiving a signal to the light being turned on.
- signal to gate (ms): The time it takes from receiving a signal to the gate being opened.
- signal to card (ms): The time it takes from receiving a signal to the card being validated.
- light task calls (1s): The number of times the light task is executed in one second.
- gate task calls (1s): The number of times the gate task is executed in one second.
- render task calls (1s): The number of times the render task is executed in one second.

## New version

|     | signal to light (ms) | light task calls (1s) | signal to gate (ms)  | gate task calls (1s)  | render task calls (1s) | signal to card (ms) |
|-----|----------------------|-----------------------|----------------------|-----------------------|------------------------|---------------------|
| 1   | 201.68               | 3023                  | 33.96                | 365                   | 4                      | 278.13              |
| 2   | 168.05               | 2309                  | 134.63               | 365                   | 4                      | 320.58              |
| 3   | 201.74               | 2311                  | 33.89                | 365                   | 4                      | 303.75              |
| 4   | 151.37               | 2319                  | 197.97               | 278                   | 4                      | 261.25              |
| 5   | 185.00               | 2307                  | 147.67               | 453                   | 4                      | 324.57              |
| 6   | 197.77               | 2313                  | 185.13               | 566                   | 4                      | 274.05              |
| 7   | 151.34               | 2307                  | 185.17               | 365                   | 4                      | 320.67              |
| 8   | 168.00               | 1762                  | 168.46               | 453                   | 4                      | 277.96              |
| 9   | 50.41                | 2309                  | 50.75                | 566                   | 4                      | 358.30              |
| 10  | 33.68                | 2313                  | 17.07                | 365                   | 4                      | 303.80              |
| 11  | 67.24                | 2312                  | 67.29                | 453                   | 4                      | 383.60              |
| 12  | 151.29               | 2308                  | 17.24                | 566                   | 4                      | 320.58              | 
| 13  | 184.89               | 2305                  | 67.49                | 366                   | 4                      | 277.98              |
| 14  | 201.82               | 2312                  | 198.02               | 453                   | 4                      | 320.51              |
| 15  | 151.39               | 2310                  | 84.22                | 566                   | 4                      | 303.74              |
| 16  | 184.94               | 1764                  | 50.74                | 365                   | 4                      | 374.60              |
| 17  | 130.59               | 2306                  | 84.24                | 366                   | 4                      | 303.76              |
| 18  | 201.75               | 2317                  | 130.73               | 566                   | 4                      | 261.16              |
| 19  | 147.39               | 2308                  | 147.72               | 365                   | 4                      | 354.17              |
| 20  | 68.00                | 2307                  | 84.41                | 365                   | 4                      | 286.83              |
| AVG | 149.92               | 2291                  | 109.56               | 428                   | 4                      | 310.50              |

## Old version

|     | signal to light (μs) | light task calls (1s) | signal to gate (μs)  | gate task calls (1s)  | render task calls (1s) | signal to card (ms) |
|-----|----------------------|-----------------------|----------------------|-----------------------|------------------------|---------------------|
| 1   | 16.00                | 7                     | 124.00               | 7                     | 7                      | 115.00              |
| 2   | 16.00                | 7                     | 124.00               | 7                     | 7                      | 115.00              |
| 3   | 16.00                | 7                     | 120.00               | 7                     | 7                      | 114.00              |
| 4   | 16.00                | 7                     | 120.00               | 7                     | 7                      | 114.00              |
| 5   | 16.00                | 7                     | 124.00               | 7                     | 7                      | 114.00              |
| 6   | 16.00                | 7                     | 124.00               | 7                     | 7                      | 115.00              |
| 7   | 20.00                | 7                     | 120.00               | 7                     | 7                      | 116.00              |
| 8   | 16.00                | 7                     | 120.00               | 7                     | 7                      | 115.00              |
| 9   | 16.00                | 7                     | 120.00               | 7                     | 7                      | 115.00              |
| 10  | 16.00                | 7                     | 120.00               | 7                     | 7                      | 114.00              |
| 11  | 20.00                | 7                     | 116.00               | 7                     | 7                      | 114.00              |
| 12  | 20.00                | 7                     | 120.00               | 7                     | 7                      | 114.00              |
| 13  | 20.00                | 7                     | 120.00               | 7                     | 7                      | 114.00              |
| 14  | 20.00                | 7                     | 120.00               | 7                     | 7                      | 115.00              |
| 15  | 16.00                | 7                     | 120.00               | 7                     | 7                      | 115.00              |
| 16  | 16.00                | 7                     | 120.00               | 7                     | 7                      | 114.00              |
| 17  | 16.00                | 7                     | 120.00               | 7                     | 7                      | 114.00              |
| 18  | 16.00                | 7                     | 120.00               | 7                     | 7                      | 115.00              |
| 19  | 16.00                | 7                     | 120.00               | 7                     | 7                      | 115.00              |
| 20  | 16.00                | 7                     | 128.00               | 7                     | 7                      | 115.00              |
| AVG | 17.00                | 7                     | 121.00               | 7                     | 7                      | 114.60              |

## Analysis

- The new version has a significantly higher signal to light time (149.92 ms) compared to the old version (17.00 μs).
- The signal to gate time has increased from 121.00 μs to 109.56 ms, which is a significant increase.
- The signal to card time has increased from 114.60 ms to 310.50 ms, which is also a significant increase.
- The light task calls per second have increased from 7 to 2291, indicating a more responsive system.
- The gate task calls per second have increased from 7 to 428, indicating a more responsive system.
- The render task calls per second decreased from 7 to 4, not a significant change.
- Overall, the new version has improved responsiveness in terms of task calls per second, but has increased the signal to light and signal to gate times significantly.
