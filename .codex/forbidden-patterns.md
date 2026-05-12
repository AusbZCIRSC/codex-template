# Forbidden Patterns
These patterns usually indicate AI-generated shortcuts.
## Hardcoded example fixes
Bad:
```ts
if (unit.name === "Bunch") {
  quantity = 0;
}
```
Better:
```ts
if (!unit.isScalable) {
  quantity = originalQuantity;
}
```
## UI-owned business logic

Bad:
```ts
const price = user.type === "premium" ? basePrice * 0.8 : basePrice;
```
Better:
```ts
pricingService.calculatePrice(user, item);
```
## Ingredient/string/category forcing

Bad:
```ts
if (ingredients.includes("tortilla") && ingredients.includes("onion")) {
  title = "Taco";
}
```
Better:

* Improve intent inference.
* Validate confidence.
* Keep title generation logic in the AI/domain generation layer.

## Broad silent fallbacks

Bad:
```ts
try {
  return parse(input);
} catch {
  return {};
}
```
Better:
```ts
const result = parseSafely(input);
if (!result.ok) {
  return validationError(result.error);
}
```
## Completion without verification

Bad:

* “Done, it should work.”

Better:

* Explain changed files.
* Run tests.
* Report exact commands.