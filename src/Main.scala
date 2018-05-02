import java.io.File

import org.apache.spark.SparkContext
import org.apache.spark.SparkConf
import org.apache.spark.sql.{Row, SparkSession}

import scala.collection.mutable

object Main extends App{
  val conf = new SparkConf().setAppName("Crawling-BatchView-Scala").setMaster("local[*]")
  val sc = new SparkContext(conf)
  val spark = SparkSession
    .builder()
    .appName("Crawling-BatchView-Scala")
    .config("spark.some.config.option", "some-value")
    .getOrCreate()

  //Create DataFrame with monsters ans spells
  val df = spark.read.option("multiline", "true").json("./Scrap_Monster/monsters.json")
  //df.show(false)

  val rddData = sc.parallelize(df.collect())

  def createCreature (x: Row): Creature ={
    val name = x(0).toString()
    val creature = new Creature(name)
    val spells = x.getAs[mutable.WrappedArray[String]](1).toArray
    for (spell <- spells){
      creature.addspell(spell)
    }
    creature
  }

  val rddCreatures = rddData.map(createCreature)
  val rddSpells = rddCreatures.map(creature => {
      (creature.name, creature.spells)
  }).flatMap(creature => {
    for (spell <- creature._2)
      yield (spell, creature._1)
  }).groupByKey()

  val folder = new File("spells")
  if (folder.exists) {
    folder.listFiles.foreach(_.delete())
    folder.delete()
  }
  rddSpells.saveAsTextFile(folder.getPath)


  rddSpells.take(20).foreach(println)
}
