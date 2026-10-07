class JiraClient {
  // Статическое приватное свойство для хранения единственного экземпляра соединения
  static #instance = null;
  // Статическое свойство для отслеживания текущего процесса подключения (Promise)
  static #connectionPromise = null;

  constructor(config) {
    // Предотвращаем создание инстанса через оператор new из внешнего кода
    if (JiraClient.#instance) {
      throw new Error("Используйте JiraClient.getConnection() вместо оператора new");
    }
    
    this.baseUrl = config.baseUrl.replace(/\/\$/, ''); // Убираем trailing slash
    this.credentials = btoa(`${config.username}:${config.password}`);
    
    // Отключаем проверку самоподписанных сертификатов (как в вашем примере)
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  /**
   * Главный статический метод для получения соединения
   * @param {Object} config - Параметры подключения (нужны только при первом вызове)
   * @returns {Promise<JiraClient>}
   */
  static async getConnection(config) {
    // 1. Если соединение уже успешно установлено — сразу отдаем его
    if (JiraClient.#instance) {
      return JiraClient.#instance;
    }

    // 2. Если соединение прямо сейчас устанавливается, возвращаем существующий Promise.
    // Это защищает от "гонки условий", если метод вызван одновременно из разных мест.
    if (JiraClient.#connectionPromise) {
      return JiraClient.#connectionPromise;
    }

    // 3. Создаем новый процесс подключения
    JiraClient.#connectionPromise = (async () => {
      try {
        if (!config) {
          throw new Error("Конфигурация обязательна для инициализации соединения Jira.");
        }

        const client = new JiraClient(config);
        
        // Валидируем соединение тестовым запросом (например, запрашиваем профиль пользователя)
        await client.request('/rest/api/2/myself');
        
        // Если запрос успешен, сохраняем экземпляр
        JiraClient.#instance = client;
        return client;
      } catch (error) {
        // Если произошла ошибка, сбрасываем Promise, чтобы можно было попробовать снова
        JiraClient.#connectionPromise = null;
        throw new Error(`Ошибка подключения к Jira: ${error.message}`);
      }
    })();

    return JiraClient.#connectionPromise;
  }

  /**
   * Универсальный метод для выполнения запросов к вашему инстансу Jira
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    console.log(`request(${url})`)
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Basic ${this.credentials}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`Jira API error! Status: ${response.status}`);
    }

    return await response.json();
  }
}

// Экспортируем класс для работы в других файлах
export default JiraClient;