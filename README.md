## Serverless REST Assignment - Distributed Systems.

__Name:__ Arthur Bilyk

__Demo:__ https://youtu.be/K98MPIkY2ng
          Link for signout request: https://youtu.be/JwPahKFAzuA

### Context.

The context for this web API is a gaming application that stores and manages details about games and game developers. The main database table, Games, stores attributes such as:

    id: Unique identifier for each game
    name: Title of the game
    description: Brief summary of the game
    developer: Name of the game's developer
    publisher: Game's publisher
    genre_ids: Array of genre identifiers
    platform: Platform on which the game is available
    release_date: Game release date
    rating: Average rating
    rating_count: Number of ratings
    is_multiplayer: Boolean indicating multiplayer capability
    cover_image_path: Path to the game's cover image
    popularity: Popularity score of the game
    userId: Provides a unique id to show who created the table

Another table, GameDeveloper, manages developer-specific data and relationships to games, with attributes such as:

    developerName: Name of the developer
    gameId: Identifier of the related game
    roleName: Role of the developer
    roleDescription: Description of the developer's role

### App API endpoints.

POST /games - Add a new game entry to the database.
GET /games - Retrieve all games.
GET /games/{gameId} - Retrieve details of a specific game by its ID.
DELETE /games/{gameId} - Delete a specific game entry.
GET /games/developers - Retrieve information about game developers.
PUT /games/{gameId} - Update the details of a specific game.
 
### Update constraint (if relevant).

For updates, only the user who initially added a game entry to the database is authorized to modify it. This is enforced by validating the userId from the JWT token against the userId stored with each game entry, ensuring that only the original creator can update their entries.

### Translation persistence (if relevant).

To reduce redundant requests to Amazon Translate, translations are persisted in the database upon the first translation request. If a user requests the same translation again, it retrieves the stored translation, bypassing Amazon Translate and optimizing both speed and cost.

###  Extra (If relevant).

ddbDocClient was used in each lambda to reduce deployment times.
