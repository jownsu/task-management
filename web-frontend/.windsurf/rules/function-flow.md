---
trigger: always_on
---

# Code Organization Rules and Patterns

## Function Flow and File Structure

### 1. Service Layer (`_services/`)
- Naming: `[feature].service.ts`
- Class extends `APIClient`
- Constructor sets base URL path
- Functions follow pattern:
```typescript
functionName = () => {
    return this.get<ResponseType[]>("/endpoint")
        .then((res) => {
            if (!res.status) {
                throw res.error;
            }
            return res.result;
        })
        .catch((error) => {
            throw error;
        });
};
```
- Documentation template:
```typescript
/**
 * DOCU: One-line description of what the function does. <br>
 * Triggered: When/where this function is called. <br>
 * Last Updated Date: [Current Date]
 * @author AuthorName
 */
```

### 2. Query Hooks (`_hooks/queries/`)
- Naming: `[feature].queries.ts`
- Uses `@tanstack/react-query`
- Function pattern:
```typescript
export const useGet[Feature] = () => {
    const { data: [name], ...rest } = useQuery({
        queryKey: CACHE_KEY_[FEATURE],
        queryFn: () => [feature]Service.[method](),
        staleTime: STALE_TIME,
    });

    return { [name], ...rest };
};
```
- Documentation follows same pattern as services

### 3. Cache Keys (`_constants/cache_keys.ts`)
- Naming: `CACHE_KEY_[FEATURE]`
- Array format: `[feature, sub_feature]`
- Export as const
```typescript
export const CACHE_KEY_[FEATURE] = ["feature", "sub_feature"] as const;
```

### 4. Mock Routes (`mock/routes/`)
- Naming: `[feature].route.mjs`
- Exports default function accepting `app`
- Route pattern: `/api/[base_url]/[endpoint]`
- Response format:
```javascript
{
    status: true,
    result: data,
    error: null
}
```

### 5. Prefetch Functions (`_prefetch/`)
- Naming: `[feature].prefetch.ts`
- Uses `getQueryClient` and `dehydrate`
- Pattern:
```typescript
export const prefetch[Feature] = async () => {
    const queryClient = getQueryClient();

    await queryClient.prefetchQuery({
        queryKey: CACHE_KEY_[FEATURE],
        queryFn: () => [feature]Service.[method]()
    });

    return await dehydrate(queryClient);
};
```

### 6. Interfaces/Types (`_entities/`)
- Location: `_entities/interface/[feature].interface.ts`
- Clear property types
- Documentation for complex types
- Export named interfaces

## Naming Conventions

1. **Files:**
   - Services: `[feature].service.ts`
   - Queries: `[feature].queries.ts`
   - Routes: `[feature].route.mjs`
   - Prefetch: `[feature].prefetch.ts`
   - Interfaces: `[feature].interface.ts`

2. **Functions:**
   - Services: `get[Feature]`, `create[Feature]`, etc.
   - Queries: `useGet[Feature]`, `useCreate[Feature]`, etc.
   - Prefetch: `prefetch[Feature]`

3. **Cache Keys:**
   - Format: `CACHE_KEY_[FEATURE]_[SUBFEATURE]`
   - All uppercase with underscores

## Documentation Standards

1. **Service Functions:**
```typescript
/**
 * DOCU: [What the function does] <br>
 * Triggered: [When/where function is called] <br>
 * Last Updated Date: [Current Date]
 * @author AuthorName
 */
```

2. **Interfaces:**
```typescript
/**
 * Used by: [List of major components/features] 
 * Last Updated: [Date]
 * @author AuthorName
 */
```

## Best Practices

1. **Type Safety:**
   - Always specify return types
   - Use interfaces over direct types
   - Avoid `any` types

2. **Error Handling:**
   - Always check `res.status`
   - Throw `res.error` on failure
   - Catch and rethrow errors

3. **Query Pattern:**
   - Use stale time from constants
   - Destructure data with meaningful names
   - Return rest properties for loading/error states

4. **Mock Data:**
   - Represent realistic data structures
   - Include all required fields
   - Use enums for status/type fields

## Prompting Guide

When requesting new features, include:

1. **Feature Type:**
   - Service function
   - Query hook
   - Mock route
   - Interface/Type
   - Prefetch function

2. **Required Information:**
   - Endpoint path
   - Response data structure
   - Required types/interfaces
   - When/where it will be used

3. **Example:**
```
Please create a [feature] function flow with:
1. Service function in [feature].service.ts
2. Query hook in [feature].queries.ts
3. Mock route in [feature].route.mjs
4. Cache key in cache_keys.ts
5. Prefetch function in [feature].prefetch.ts

Data structure:
[Provide example response JSON]

Types needed:
[List required interfaces/types]
```