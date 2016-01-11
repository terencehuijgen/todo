json.array!(@todos) do |todo|
  json.extract! todo, :id, :uid, :content
  json.url todo_url(todo, format: :json)
end
