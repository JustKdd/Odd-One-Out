// Theme options with language support, separated from Lobby
export const THEMES: Record<string, { en: string[]; bg: string[] }> = {
    Objects: {
        en: [
            "Chair", "Table", "Lamp", "Mirror", "Bottle", "Backpack", "Book", "Phone",
            "Laptop", "Glasses", "Watch", "Pen", "Pencil", "Key", "Wallet", "Bed",
            "Spoon", "Fork", "Knife", "TV", "Remote", "Headphones", "Towel", "Shoe"
        ],
        bg: [
            "Стол", "Маса", "Лампа", "Огледало", "Бутилка", "Раница", "Книга", "Телефон",
            "Лаптоп", "Очила", "Часовник", "Химикалка", "Молив", "Ключ", "Портфейл", "Легло",
            "Лъжица", "Вилица", "Нож", "Телевизор", "Дистанционно", "Слушалки", "Кърпа", "Обувка"
        ]
    },
    Movies: {
        en: [
            "Inception", "Titanic", "The Godfather", "Avatar", "The Dark Knight", "Interstellar",
            "Jurassic Park", "The Matrix", "Star Wars", "Avengers", "Frozen", "Gladiator",
            "Shrek", "Finding Nemo", "Toy Story", "The Lion King", "Forrest Gump", "Pulp Fiction"
        ],
        bg: [
            "Генезис", "Титаник", "Кръстникът", "Аватар", "Черният рицар", "Интерстелар",
            "Джурасик парк", "Матрицата", "Междузвездни войни", "Отмъстителите", "Замръзналото кралство", "Гладиатор",
            "Шрек", "Търсенето на Немо", "Играта на играчките", "Цар Лъв", "Форест Гъмп", "Криминале"
        ]
    },
    People: {
        en: [
            "Albert Einstein", "Elon Musk", "Oprah Winfrey", "Michael Jordan", "Taylor Swift",
            "Cristiano Ronaldo", "Barack Obama", "Leonardo da Vinci", "Beyoncé", "Usain Bolt",
            "Lionel Messi", "Bill Gates", "Steve Jobs", "Lady Gaga", "Tom Hanks"
        ],
        bg: [
            "Алберт Айнщайн", "Илон Мъск", "Опра Уинфри", "Майкъл Джордан", "Тейлър Суифт",
            "Кристиано Роналдо", "Барак Обама", "Леонардо да Винчи", "Бионсе", "Юсейн Болт",
            "Лионел Меси", "Бил Гейтс", "Стив Джобс", "Лейди Гага", "Том Ханкс"
        ]
    },
    Fruits: {
        en: [
            "Apple", "Banana", "Orange", "Grape", "Mango", "Pear", "Peach", "Strawberry",
            "Blueberry", "Watermelon", "Pineapple", "Kiwi", "Papaya", "Cherry", "Plum"
        ],
        bg: [
            "Ябълка", "Банан", "Портокал", "Грозде", "Манго", "Круша", "Праскова", "Ягода",
            "Боровинка", "Диня", "Ананас", "Киви", "Папая", "Череша", "Слива"
        ]
    },
    Animals: {
        en: [
            "Dog", "Cat", "Elephant", "Lion", "Tiger", "Zebra", "Horse", "Monkey", "Kangaroo",
            "Giraffe", "Bear", "Wolf", "Panda", "Fox", "Rabbit", "Dolphin", "Shark", "Whale"
        ],
        bg: [
            "Куче", "Котка", "Слон", "Лъв", "Тигър", "Зебра", "Кон", "Маймуна", "Кенгуру",
            "Жираф", "Мечка", "Вълк", "Панда", "Лисица", "Заек", "Делфин", "Акула", "Кит"
        ]
    },
    Countries: {
        en: [
            "France", "Germany", "Italy", "Spain", "Japan", "Brazil", "Canada", "Egypt",
            "India", "China", "Australia", "Mexico", "Russia", "Argentina", "South Africa"
        ],
        bg: [
            "Франция", "Германия", "Италия", "Испания", "Япония", "Бразилия", "Канада", "Египет",
            "Индия", "Китай", "Австралия", "Мексико", "Русия", "Аржентина", "Южна Африка"
        ]
    },
    Sports: {
        en: [
            "Football", "Basketball", "Tennis", "Cricket", "Hockey", "Rugby", "Baseball",
            "Golf", "Boxing", "MMA", "Cycling", "Swimming", "Running", "Skiing", "Volleyball"
        ],
        bg: [
            "Футбол", "Баскетбол", "Тенис", "Крикет", "Хокей", "Ръгби", "Бейзбол",
            "Голф", "Бокс", "ММА", "Колоездене", "Плуване", "Бягане", "Ски", "Волейбол"
        ]
    },
    Foods: {
        en: [
            "Pizza", "Burger", "Pasta", "Sushi", "Steak", "Salad", "Soup", "Sandwich",
            "Tacos", "Ice Cream", "Chocolate", "Cheese", "Rice", "Curry", "Noodles", "Dumplings"
        ],
        bg: [
            "Пица", "Бургер", "Паста", "Суши", "Стек", "Салата", "Супа", "Сандвич",
            "Такос", "Сладолед", "Шоколад", "Сирене", "Ориз", "Къри", "Нудли", "Кнедли"
        ]
    },
    Brands: {
        en: [
            "Nike", "Adidas", "Apple", "Samsung", "Google", "Microsoft", "Coca-Cola",
            "Pepsi", "Toyota", "BMW", "Mercedes", "Sony", "Amazon", "McDonald's", "Starbucks"
        ],
        bg: [
            "Nike", "Adidas", "Apple", "Samsung", "Google", "Microsoft", "Coca-Cola",
            "Pepsi", "Toyota", "BMW", "Mercedes", "Sony", "Amazon", "McDonald's", "Starbucks"
        ]
    },
    Cities: {
        en: [
            "New York", "London", "Paris", "Tokyo", "Los Angeles", "Berlin", "Rome", "Dubai",
            "Moscow", "Shanghai", "Barcelona", "Sydney", "Istanbul", "Toronto", "Mumbai"
        ],
        bg: [
            "Ню Йорк", "Лондон", "Париж", "Токио", "Лос Анджелис", "Берлин", "Рим", "Дубай",
            "Москва", "Шанхай", "Барселона", "Сидни", "Истанбул", "Торонто", "Мумбай"
        ]
    },
    Books: {
        en: [
            "Harry Potter", "The Hobbit", "The Lord of the Rings", "Pride and Prejudice",
            "1984", "The Great Gatsby", "Moby Dick", "To Kill a Mockingbird",
            "The Catcher in the Rye", "The Da Vinci Code", "The Alchemist", "Dracula"
        ],
        bg: [
            "Хари Потър", "Хобитът", "Властелинът на пръстените", "Гордост и предразсъдъци",
            "1984", "Великият Гетсби", "Моби Дик", "Да убиеш присмехулник",
            "Спасителят в ръжта", "Шифърът на Леонардо", "Алхимикът", "Дракула"
        ]
    },
    "TV Shows": {
        en: [
            "Friends", "Breaking Bad", "Game of Thrones", "Stranger Things", "The Office",
            "Sherlock", "The Simpsons", "How I Met Your Mother", "The Crown", "Peaky Blinders",
            "House of the Dragon", "Modern Family", "Lost", "Seinfeld"
        ],
        bg: [
            "Приятели", "В обувките на Сатаната", "Игра на тронове", "Странни неща", "Офисът",
            "Шерлок", "Семейство Симпсън", "Как се запознах с майка ви", "Короната", "Остри козирки",
            "Домът на дракона", "Модерно семейство", "Изгубени", "Сайнфелд"
        ]
    },
    Jobs: {
        en: [
            "Doctor", "Teacher", "Engineer", "Chef", "Pilot", "Farmer", "Artist", "Nurse",
            "Scientist", "Lawyer", "Actor", "Singer", "Writer", "Athlete", "Police Officer"
        ],
        bg: [
            "Лекар", "Учител", "Инженер", "Готвач", "Пилот", "Фермер", "Артист", "Медицинска сестра",
            "Учeн", "Адвокат", "Актьор", "Певец", "Писател", "Спортист", "Полицай"
        ]
    },
    Instruments: {
        en: [
            "Guitar", "Piano", "Drums", "Violin", "Flute", "Trumpet", "Saxophone", "Cello",
            "Harp", "Clarinet", "Trombone", "Ukulele", "Accordion", "Banjo"
        ],
        bg: [
            "Китара", "Пиано", "Барабани", "Цигулка", "Флейта", "Тромпет", "Саксофон", "Виолончело",
            "Арфа", "Кларинет", "Тромбон", "Укулеле", "Акордеон", "Банджо"
        ]
    },
    Colors: {
        en: [
            "Red", "Blue", "Green", "Yellow", "Purple", "Orange", "Black", "White",
            "Pink", "Brown", "Gray", "Turquoise", "Gold", "Silver"
        ],
        bg: [
            "Червен", "Син", "Зелен", "Жълт", "Лилав", "Оранжев", "Черен", "Бял",
            "Розов", "Кафяв", "Сив", "Тюркоаз", "Златен", "Сребърен"
        ]
    },
    Vehicles: {
        en: [
            "Car", "Bus", "Train", "Bicycle", "Plane", "Boat", "Truck", "Helicopter",
            "Scooter", "Motorcycle", "Submarine", "Tram", "Spaceship"
        ],
        bg: [
            "Кола", "Автобус", "Влак", "Велосипед", "Самолет", "Лодка", "Камион", "Хеликоптер",
            "Скутер", "Мотоциклет", "Подводница", "Трамвай", "Космически кораб"
        ]
    }
};
