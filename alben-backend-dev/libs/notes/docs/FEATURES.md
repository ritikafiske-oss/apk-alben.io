# Features Classification

## CORE (Frozen)
> These features are critical and should not change without a major version update.

1.  **Get Remainder Notes**
    - Retrieve notes with remainder dates.
    - **Filters**:
        - `type`: 'All' | 'Note' | 'Reminder'
        - `filter_by`: 'today' | 'tomorrow' | 'upcoming' | 'past'
        - `company_id`: ID of the company.
    - **Relations**: Fetches associated `contact` (firstname, lastname) and `creator` (firstname, lastname).
    - **Pagination**: Returns list of notes with total count.

## FLEX (Changeable)
> These features are likely to evolve or are not yet fully defined.

1.  **Note Types**
    - The distinction between 'Note' and 'Reminder' might be refined.
2.  **Date Logic**
    - "Upcoming" currently defaults to next 7 days, which might change.
